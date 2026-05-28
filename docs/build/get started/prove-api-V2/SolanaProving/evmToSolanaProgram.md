---
sidebar_position: 3
sidebar_label: 'Proving EVM Events: Solana Program'
---

# Proving EVM Events on Solana

## Overview

This guide focuses specifically on integrating with Polymer Prover through Cross-Program Invocation (CPI) in your Solana program. The Polymer Prover handles the cryptographic verification of proofs, while your program can focus on business logic based on the validated results.

1. **Proof Lifecycle**:
    - Proof data is loaded into the cache account
    - Validation reads from this cache account
    - The cache is cleared after validation
    - To validate the same proof again, you need to reload it
2. **Automatic Account Creation**:
    - The Polymer Prover automatically creates the cache account during `load_proof`
    - You don't need to create this account explicitly
    - The internal account should already exist on mainnet/devnet
3. **Return Data**:
    - When called via CPI, Polymer Prover returns the validation result via `set_return_data`
    - Your program can access this data to make decisions based on the validation result
4. **Transaction Size Limits**:
    - For large proofs, split them into chunks and call `load_proof` multiple times
    - The cache persists between transactions until validation is called

## Implementing Polymer Prover Integration

### 1. Import Required Modules

```rust
use anchor_lang::prelude::*;
use polymer_prover::cpi::accounts::{LoadProof as PolymerLoadProof, ValidateEvent as PolymerValidateEvent};
use polymer_prover::instructions::validate_event::ValidateEventResult;
use anchor_lang::solana_program::program::get_return_data;
```

### 2. Define Polymer Prover Program ID

```rust
// Polymer Prover Program ID - hardcoded value for the published program
pub const POLYMER_PROVER_ID: Pubkey = anchor_lang::solana_program::pubkey!("CdvSq48QUukYuMczgZAVNZrwcHNshBdtqrjW26sQiGPs");
```

### 3. Implement Account Structures for CPI Calls

For proof loading:

```rust
#[derive(Accounts)]
pub struct LoadProof<'info> {
    /// CHECK: This is the polymer prover program
    #[account(address = POLYMER_PROVER_ID)]
    pub polymer_prover: AccountInfo<'info>,

    /// CHECK: This is the cache account for the proof
    /// IMPORTANT: This will be automatically created by Polymer Prover if it doesn't exist
    #[account(mut)]
    pub cache_account: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

For proof validation:

```rust
#[derive(Accounts)]
pub struct ValidateProof<'info> {
    /// CHECK: This is the polymer prover program
    #[account(address = POLYMER_PROVER_ID)]
    pub polymer_prover: AccountInfo<'info>,

    /// CHECK: This is the cache account for the proof
    /// This is the same PDA that was automatically created during load_proof
    #[account(mut)]
    pub cache_account: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This is the internal account for the prover
    #[account(mut)]
    pub internal: UncheckedAccount<'info>,

    /// CHECK: This is the instructions sysvar account required by Polymer
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
```

### 4. Implement Instruction Logic

For loading proofs:

```rust
pub fn load_proof(ctx: Context<LoadProof>, proof: Vec<u8>) -> Result<()> {
    msg!("Loading proof into polymer prover");

    // Call the polymer-prover program to load the proof
    polymer_prover::cpi::load_proof(
        CpiContext::new(
            ctx.accounts.polymer_prover.to_account_info(),
            PolymerLoadProof {
                cache_account: ctx.accounts.cache_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        ),
        proof,
    )
}
```

For validating proofs:

```rust
pub fn validate_proof(ctx: Context<ValidateProof>) -> Result<()> {
    msg!("Validating proof with polymer prover");

    // Call the polymer-prover program to validate the event
    polymer_prover::cpi::validate_event(
        CpiContext::new(
            ctx.accounts.polymer_prover.to_account_info(),
            PolymerValidateEvent {
                cache_account: ctx.accounts.cache_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
                internal: ctx.accounts.internal.to_account_info(),
                instructions: ctx.accounts.instructions.to_account_info(),
            },
        ),
    )?;

    // Get the return data from the CPI call
    let (pid, data) = get_return_data().ok_or(ErrorCode::MissingReturn)?;
    require_keys_eq!(pid, POLYMER_PROVER_ID, ErrorCode::WrongProgram);

    // Parse the return data as a ValidateEventResult
    let result = ValidateEventResult::try_from_slice(&data)?;

    // Process the result based on its type
    match result {
        ValidateEventResult::Valid(chain_id, event) => {
            msg!(
                "Proof validated: chain_id: {}, emitting_contract: {}, topics: {:?}, unindexed_data: {:?}",
                chain_id,
                event.emitting_contract.to_hex(),
                event.topics,
                event.unindexed_data
            );

            // Validate topics length against expected event signature
            require!(
                event.topics.len() == EXPECTED_TOPIC_COUNT,
                ErrorCode::InvalidTopicCount
            );

            // Add your business logic here based on the validated event
            // For example, if this is a token bridge:
            // if chain_id == ETHEREUM_CHAIN_ID &&
            //    event.emitting_contract == BRIDGE_CONTRACT &&
            //    is_transfer_event(event.topics) {
            //     mint_tokens(event.unindexed_data);
            // }
            // OR Simply respond with success message to trigger
            // subsequent actions within another function
        }
        _ => {
            msg!("Prover returned error: {}", result);
            // Handle error cases
        }
    }

    Ok(())
}
```

:::warning Critical Security Check
The `topics` length must be checked against the expected length for the event being decoded. This validates that the topics length matches what is expected for the event signature. If this validation is skipped, arbitrary length topic arrays can be passed in and impact parsing of unindexed data.
:::

### 5. Define Error Codes

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Missing return data")]
    MissingReturn,
    #[msg("Wrong program returned data")]
    WrongProgram,
    #[msg("Invalid topic count for expected event signature")]
    InvalidTopicCount,
}
```

## Automatic Cache Account Creation and Why

In blockchain environments like Solana, there are fundamental constraints that make handling state proofs challenging:

1. **Transaction Size Limits**: Solana transactions have a maximum size limit of approximately 1232 bytes.
2. **Compute Budget Constraints**: Validation of cryptographic proofs is computationally intensive and exceeds what can be done in a single instruction's default compute budget.

To address these limitations, Polymer Prover implements a two-step process:

1. **Load**: Split and load the proof into a persistent storage account
2. **Validate**: Process the loaded proof with sufficient compute resources

### Purpose of the Cache Account

The cache account serves as temporary storage for the proof data between loading and validation steps. It:

- Stores the serialized proof data across multiple transactions
- Allows proofs larger than the transaction size limit to be handled
- Persists until validation is complete
- Gets automatically cleared after validation to free up space

### Automatic Creation by Polymer Prover

One of the elegant aspects of the Polymer Prover design is that **you don't need to manually create the cache account**. The Polymer Prover automatically:

1. Derives a deterministic PDA (Program Derived Address) from the authority's public key:

```rust
#[account(
    init_if_needed,
    seeds = [authority.key().as_ref()],
    bump,
    payer = authority,
    space = DISCRIMINATOR_SIZE + ProofCacheAccount::INIT_SPACE,
)]
pub cache_account: Account<'info, ProofCacheAccount>
```

2. Creates the account on first use with the `init_if_needed` constraint
3. Sizes it appropriately to handle typical proof sizes
4. Makes the authority (usually the user) pay for the account's rent

### How it looks in Practice

When implementing a client or program that uses the Polymer Prover:

```tsx
// 1. Simply derive the cache PDA - no need to create it
const [cachePDA] = PublicKey.findProgramAddressSync(
  [wallet.publicKey.toBuffer()],
  POLYMER_PROVER_ID
);

// 2. Call load_proof with your proof chunks
// The cache account will be automatically created if it doesn't exist
await program.methods.loadProof(proofChunk)
  .accounts({
    polymerProver: POLYMER_PROVER_ID,
    cacheAccount: cachePDA,  // This account will be auto-created if needed
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId
  })
  .rpc();
```

---
sidebar_position: 0
sidebar_label: 'Proving Solana Logs on EVM'
---

# Solana Logs Verification Requirements

This guide will walk you through the process of proving and verifying Solana program logs on EVM chains using Polymer's state proof system. By following these steps, you'll be able to emit logs on Solana and then cryptographically verify them on any EVM chain.

This Solana documentation section will follow this example: [solana-polymer-prover-cpi](https://github.com/dpbmaverick98/solana-polymer-prover-cpi/blob/main/programs/my_anchor_project/src/lib.rs)

### Overview

1. Emit a log message on Solana with a specific format
2. Generate a state proof using Polymer's API
3. Verify the proof on an EVM chain using Polymer's prover contract

## Log Format Requirements

For logs to be properly recognized by the Light client on Polymer Rollup, you must:

1. Use the `msg!` macro in your Solana program
2. Include the `Prove:` prefix in your log messages
3. **Include the runtime program ID in your log messages.** 
4. Emit the log from the program that you want to validate

Here's the required log format in Rust:

```rust
// Inside your Solana program
pub fn log_key_value(ctx: Context<LogKeyValue>, key: String, value: String) -> Result<()> {
    // Update state
    let logger_account = &mut ctx.accounts.logger_account;
    logger_account.nonce += 1;

    // Get the actual runtime program ID
    let program_id = ctx.program_id;

    // Optional: Verify against expected ID for additional security
    require!(program_id == &crate::ID, ErrorCode::ProgramIdMismatch);

    // Emit properly formatted log with "Prove:" prefix and program ID
    msg!("Prove: program: {}, Key: {}, Value: {}, Nonce: {}",
         program_id,                    // ✅ Required: Runtime program ID
         key,
         value,
         logger_account.nonce);

    // You can emit multiple provable logs in one transaction
    msg!("Prove: program: {}, Another log that can be verified!", program_id);

    Ok(())
}

```

**Standard Format Options:**

```rust
// Option 1: Comma-delimited format (NOTE)
msg!("Prove: program: {}, EVENT_NAME: {}, user: {}, amount: {}, nonce: {}", 
     ctx.program_id, "BRIDGE_DEPOSIT", user, amount, nonce);

// Option 2: Simple event format
msg!("Prove: program: {}, Key: {}, Value: {}, Nonce: {}", 
     ctx.program_id, key, value, nonce);

// Option 3: Compact format
msg!("Prove: program: {}, action: {}, data: {}:{}:{}", 
     ctx.program_id, "TRANSFER", user, amount, nonce);

```

## Important Notes for Log Emission

- **Program Identity**: The logs must be emitted directly from the program you want to validate, not from a CPI call to another program.
- **Runtime Program ID**: Always use `ctx.program_id` in your logs - this provides unforgeable program attribution and cannot be spoofed by attackers.
    - **Comma Delimiter**: Use commas as the main delimiter to separate fields for easier parsing on EVM chains.
- **Log Size**: Keep logs reasonably sized (< 500 bytes) to ensure they fit in the transaction receipt.
- **Multiple Logs**: You can emit multiple logs with the "Prove:" prefix in a single transaction, but this increases proof payload size.
- **Transaction Success**: Only logs from successful transactions can be proven.

## Enhanced Security with Runtime Program ID

Including the runtime program ID in your logs provides triple verification security:

1. **Log-level**: Program ID embedded within the log message
2. **Request-level**: Program ID specified in the proof request
3. **Validation-level**: Program ID returned by Prover contract must match Program ID in logMessages

### Why This is Required

- `ctx.program_id` is provided by Solana's runtime and cannot be spoofed
- Even if an attacker deploys identical code, they get a different program address
- Creates cryptographic proof of which exact program emitted the log
- Makes program impersonation attacks impossible, including CPI-based attacks
- Comma delimiters enable clean parsing of program ID and event data on EVM chains

:::info Security Note
This runtime program ID verification makes Polymer's Solana light client significantly more robust against program impersonation and log attribution attacks. The comma-delimited format ensures reliable parsing and verification on EVM chains.
:::

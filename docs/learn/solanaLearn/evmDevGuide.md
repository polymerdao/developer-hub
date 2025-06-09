---
sidebar_position: 0
sidebar_label: 'Intro to Solana'
---

# An EVM Developer's Guide to Solana Proving

## Ethereum (EVM) Proof System

In Ethereum, you have:

- **State Root**: Merkle root of the entire state trie at a given block
- **Receipt Root**: Merkle root of all transaction receipts in a block
- **Merkle Proofs**: You can prove inclusion of any state or event by providing a merkle path

This allows for **stateless verification** - you can prove something happened without having the full state.

## Solana (SVM) Proof System

Solana deliberately avoids merkleization for performance reasons, but provides proofs through different mechanisms:

### 1. **Account State Proofs**

Instead of a global state root, Solana uses:

- **Account Hash**: Each account has a hash based on its data, lamports, owner, etc.
- **Bank Hash**: A hash of all account states at a given slot
- **Accounts Delta Hash**: Hash of state changes within a slot

### 2. **Transaction Confirmation Proofs**

For proving transactions occurred:

- **Transaction Signatures**: Cryptographic proof the transaction was included
- **Slot Confirmation**: Validators attest to the slot's validity
- **Vote Records**: Validator consensus proofs stored on-chain

### 3. **Program Log Verification**

For events/logs (equivalent to Ethereum events):

- **Program Logs**: Stored in transaction metadata
- **Return Data**: Programs can return data that gets included in transaction results
- **Account State Changes**: Before/after snapshots of affected accounts

:::info
Polymer prioritizes event proofs for EVM chains, given their developer experience and proving costs. For consistency, we follow a similar approach with Solana by using Program Log verification with Confirmation proofs. 
:::

### How EVM Log Proof Work

```

Block Header
├── Receipt Root (merkle root of all transaction receipts)
│
Transaction Receipts Trie
├── Receipt 0
│   ├── status, gasUsed, logsBloom
│   └── logs: [
│       {
│         address: "0x123...",
│         topics: ["0xEventHash", "0xIndexedParam1", ...],
│         data: "0x..."
│       }
│   ]
```

### How SVM Log Proofs Work

```
Slot N (confirmed slot 2/3+ stake-weighted validators)
├── Block Hash = hash(previous_hash, entries[], accounts_delta_hash)
    └── Transaction[i] = {signatures[], message, meta}
        └── TransactionMeta = {
            err: Option<Error>,
            logs: Vec<String>,           // ← Program-emitted logs
            return_data: Option<Data>,   // ← Structured program output
            pre_balances: Vec<u64>,
            post_balances: Vec<u64>,
            pre_token_balances: Vec<TokenBalance>,
            post_token_balances: Vec<TokenBalance>
        }
            └── Log[j] = "Program {program_id} invoke [depth]" |
                        "Program log: {custom_message}" |
                        "Program {program_id} success/failed"
                        
```

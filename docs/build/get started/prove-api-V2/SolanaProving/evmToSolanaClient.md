---
sidebar_position: 4
sidebar_label: 'Proving EVM Events: Client Integration'
---

# Prover Application CPI Client Guide

## Key Components for Proof Loading

### 1. Proof Preparation and Chunking

```tsx
// Decode base64-encoded proof into binary format
const proofBuffer = Buffer.from(base64EncodedProof, 'base64');
console.log(`Decoded proof length: ${proofBuffer.length} bytes`);

// Split the proof into manageable chunks
const MAX_CHUNK_SIZE = 800; // Stay under transaction size limits
const chunks: Buffer[] = [];
for (let i = 0; i < proofBuffer.length; i += MAX_CHUNK_SIZE) {
  chunks.push(proofBuffer.slice(i, Math.min(i + MAX_CHUNK_SIZE, proofBuffer.length)));
}
console.log(`Split proof into ${chunks.length} chunks:`);
chunks.forEach((chunk, i) => console.log(`  Chunk ${i+1}: ${chunk.length} bytes`));
```

### 2. Cache Account PDA Derivation

```tsx
// Derive the cache account PDA from the wallet's public key
const [cachePDA] = anchor.web3.PublicKey.findProgramAddressSync(
  [wallet.publicKey.toBuffer()],
  POLYMER_PROVER_ID
);
console.log(`Using cache PDA: ${cachePDA.toString()}`);
```

| Common Errors | Description | Resolution |
| --- | --- | --- |
| `Transaction too large` | Chunk size exceeds limit | Reduce chunk size (max 800 bytes recommended) |
| `Block height exceeded` | Sequence issue | Add delays between transactions |
| `Account ownership error` | Wrong PDA derivation | Check PDA seed and POLYMER_PROVER_ID |
| `Out of memory` | Proof too large | Ensure uniform chunking across the entire proof |

## Key Components for Validation

### 1. Account Preparation with Internal Account

```tsx
// Derive the cache account PDA - same derivation used in load-proof
const [cachePDA] = anchor.web3.PublicKey.findProgramAddressSync(
  [wallet.publicKey.toBuffer()],
  POLYMER_PROVER_ID
);

// Derive the internal account PDA
const [internalPDA] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("internal")],
  POLYMER_PROVER_ID
);
```

### 2. Compute Budget Allocation

```tsx
// CRITICAL: Set higher compute budget limits for validation
const modifyComputeUnits = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
  units: 1_400_000 // Proof validation is very compute intensive
});

// Add priority fee to improve transaction confirmation speed
const addPriorityFee = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 10_000
});
```

| Common Errors | Description | Resolution |
| --- | --- | --- |
| `Exceeded compute units` | Not enough compute budget | Set compute unit limit to 1.4M (Solana's per-transaction maximum) |
| `Account not initialized` | Cache account doesn't exist | Call load_proof first to create it |
| `AccountDiscriminatorMismatch` | Wrong account structure | Use correct PDA derivation |
| `Missing return data` | CPI call failed | Ensure all accounts are passed correctly |

## PDA Reference

### Cache Account PDA

The Polymer Prover **automatically creates** a Cache Account PDA when you call `load_proof` if it doesn't already exist. This is a key feature to understand:

- **PDA Derivation**: `[authority.key().as_ref()]` with Polymer Prover as the owner
- **Authority**: Typically the user/wallet who initiated the transaction
- **Automatic Creation**: No need to create this PDA yourself - the Polymer Prover handles this

### Internal Account PDA

- **PDA Derivation**: `[b"internal"]` with Polymer Prover as the owner
- **Already Initialized**: This account is already initialized on devnet/mainnet
- **Global Account**: Shared across all users of the Polymer Prover

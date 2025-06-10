---
sidebar_position: 1
sidebar_label: 'SolClient Considerations'
---

# Trust Considerations: Solana Light Client

:::info Security Breakthrough:
Polymer's runtime program ID verification makes Solana log proving as secure as EVM event proving by eliminating trust assumptions and providing cryptographic program attribution equivalent to Ethereum's proven security model.
:::

You can read more details about implementation [here](https://docs.polymerlabs.org/docs/build/SolanaProving/solanaEVMProving).

## Solana's Design Philosophy

```
Solana's Trade-off:
├── Gain: Extreme performance (50,000+ TPS)
├── Gain: Parallel execution
├── Gain: Low latency confirmation (~400ms)
└── Cost: No individual transaction provability

```

## Fundamental Architectural Differences

While EVM provides two cryptographically provable methods (storage writes and event logs), Solana only supports account storage writes as a direct representation in the block hash. This creates fundamental differences in provability models.

**However, Polymer's runtime program ID approach bridges this gap, making Solana log verification EVM-equivalent.**

## Block Structure Comparison

```
// EVM: Dual Provability Paths
Block Header
├── State Root → Storage Slots (provable via merkle proof)
└── Receipt Root → Event Logs (provable via merkle proof)

// Solana: Single Provability Path
Block Header
└── Accounts Delta Hash → Account States (provable via consensus)
    ❌ Transactions & Logs (not committed to header)

// Polymer Enhanced Solana: EVM-Like Provability
Block Header
└── Accounts Delta Hash → Account States (provable via consensus)
    ✅ Program ID in Logs (EVM-equivalent program binding via runtime verification)

```

## Security Model Comparison

```
// EVM Log Path: Simple & Secure
Transaction → Event Log → Receipt → Block Header
     ↓           ↓          ↓          ↓
  (signed)   (deterministic) (merkle)  (consensus)

✅ Single atomic proof
✅ Causal relationship preserved
✅ Program authorization implicit
✅ Timestamp precision
✅ No state manipulation possible

// Solana Account Path: Complex & Vulnerable
Transaction → Account Write → Account State → Block Header
     ↓              ↓              ↓             ↓
  (signed)    (unverifiable)   (provable)   (consensus)

❌ Multiple attack vectors
❌ Lost causal relationship
❌ Program authorization separate concern
❌ Coarse timestamp granularity
❌ State manipulation possible

// Polymer Solana Logs: EVM-Equivalent Security
Transaction → Program ID + Log → Light Client → Verification
     ↓             ↓               ↓               ↓
  (signed)    (runtime-bound)   (consensus)  (cryptographic)

✅ EVM-equivalent atomic proof
✅ Causal relationship preserved (via runtime program ID)
✅ Program authorization implicit (ctx.program_id)
✅ Slot-level precision
✅ No state manipulation possible

```

## Limitations of Account State Approach

```
// What you CAN Prove:
✅ "Account X contained data Y at slot Z"
✅ "Account state was committed in block header"
✅ "Validators confirmed block with this account state"
✅ "Data was written by specific program" (via account owner)

// What you CANNOT Prove:
❌ "Specific transaction wrote this data"
❌ "Data was written at exact timestamp T"
❌ "Transaction was atomic with state changes"
❌ "Historical state wasn't overwritten"

```

## Trust Model Analysis

### EVM Events: Zero Trust Required

```
User → Trust Level: 
├── Cryptographic proofs (merkle trees)
├── Mathematical certainty
└── No external dependencies

```

### Solana Account Write: High Trust Required

```
User → Trust Level: 
├── Trust validator consensus 
├── Trust program authorization (application overhead)
├── Trust no state manipulation (overwriting risk)
└── Trust account derivation (application overhead)

// Security Gaps:
❌ Account can exist but verification required for:
   - Which program wrote it?
   - Was it the authorized program?
   - Was it a malicious impersonator?

❌ Not Atomic with Transaction:
   - Account write could succeed even if transfer/action fails
   - Transfer/Action could succeed but account write fails

❌ Integration Overhead:
   - Requires dedicated source-side interfaces/programs
   - Complex application logic to protect PDA

```

### Polymer's Enhanced Solana Logs: EVM-Equivalent Security

```
User → Trust Level: (EVM-equivalent)
├── Trust validator consensus (reduced via light client)
└── Trust light client derivation (open source verifiable)

// EVM-Equivalent Security Achieved:
✅ Runtime program ID binding (equivalent to EVM contract binding)
✅ Atomic with transaction execution
✅ Simple verification process
✅ Immutable once included
✅ Causal relationship preserved
✅ Program impersonation impossible

```

## Polymer's Solution: Light Client Derivation with Program ID Verification

Polymer's approach uses **light client derivation** enhanced with **runtime program ID verification** that:

1. **Verifies slot confirmations** to ensure finality and prevent reorgs
2. **Validates runtime program IDs** creating EVM-equivalent program binding
3. **Represents transactions** in a verifiable Ethereum-like trie structure
4. **Publishes data** transparently on Polymer rollup with public dashboard
5. **Maintains protocol homogeneity** and scalability across chains

### EVM-Equivalent Security Achievement

By requiring `ctx.program_id` in logs, Polymer creates **cryptographic program binding** equivalent to EVM's contract-event relationship:

- **EVM**: Events cryptographically bound to emitting contract
- **Polymer Solana**: Logs cryptographically bound to emitting program via runtime ID

This transforms Solana's trust-based log verification into **EVM-equivalent cryptographic verification**, achieving security parity between the two ecosystems.

This light client derivation keeps Polymer protocol **homogeneous and scalable**. The next step is to **open-source this client derivation** so that anyone can independently verify and validate the committed roots, enhancing transparency and trust while maintaining EVM-like security guarantees.
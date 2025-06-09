---
sidebar_position: 1
sidebar_label: 'SolClient Considerations'
---

# Trust Considerations: Solana Light Client

### Solana's Design Philosophy

```
Solana's Trade-off:
├── Gain: Extreme performance (50,000+ TPS)
├── Gain: Parallel execution
├── Gain: Low latency confirmation (~400ms)
└── Cost: No individual transaction provability
```

### Fundamental Architectural Differences

While EVM provides two cryptographically provable methods (storage writes and event logs), Solana only supports account storage writes as a direct representation in the block hash. This creates fundamental differences in provability models.

### Block Structure Comparison

```
// EVM: Dual Provability Paths
Block Header
├── State Root → Storage Slots (provable via merkle proof)
└── Receipt Root → Event Logs (provable via merkle proof)

// Solana: Single Provability Path
Block Header
└── Accounts Delta Hash → Account States (provable via consensus)
    ❌ Transactions & Logs (not committed to header)

```

### Security Model Comparison

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
??? Transaction → Account Write → Account State → Block Header
     ↓              ↓              ↓             ↓
  (unknown)    (unverifiable)   (provable)   (consensus)

❌ Multiple attack vectors
❌ Lost causal relationship
❌ Program authorization separate concern
❌ Coarse timestamp granularity
❌ State manipulation possible

```

### Limitations of Account State Approach

```rust
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

### Trust Model Analysis

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

### Polymer's Solution: Light Client Derivation

```
User → Trust Level: 
├── Trust validator consensus 
└── Trust Light Client Derivation 

✅ Atomic with transaction execution
✅ Simple verification process
✅ Immutable once included
✅ Causal relationship preserved
```

Polymer's approach uses **light client derivation** that:

1. **Verifies slot confirmations** to make sure it won’t reorg. 
2. **Represents transactions** in a verifiable Ethereum-like trie structure
3. **Publishes data** transparently on Polymer rollup and displays dashboard
4. **Maintains protocol homogeneity** and scalability across chains

This light client derivation keeps the protocol **homogeneous and scalable**. The next step is to **open-source this client derivation** so that anyone can independently verify and validate the committed roots, enhancing transparency and trust.


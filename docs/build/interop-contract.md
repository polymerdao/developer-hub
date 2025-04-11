---
sidebar_position: 2
sidebar_label: 'Interoperable Contracts'
---

# **Building Interoperable Contracts**

Ethereum has grown from a single-chain network to a multi-chain world with many rollups. This shift changes how developers build scalable applications. The old ways of achieving multi-chain functionality—replicating entire application across chains or using messaging bridges.

## **The Old Way: Messaging Bridges**

![image](https://github.com/user-attachments/assets/0c5ea318-be74-4c9d-8f76-392b3097e20a)

This approach involves:

- Deploying source and destination contracts for every chain pair.
- Integrating bridge-specific logic and OApp/gateway contracts.
- Encoding application logic into payloads executed by the bridge.
- Managing on-chain fee estimation using external oracles.
- Parsing and executing data as dictated by the bridge protocol.

**Drawbacks:**

- **High engineering cost** — weeks or even months to implement and debug.
- **Single-source-to-single-destination limitation** — additional chains require more messages and more gas.
- **Infra overhead** — fees estimations by bridges often exceed 10x of execution costs.
    - LZ typical fee: $0.10–$0.25
    - HL typical fee: $0.50–$0.80
- **Manual reconfiguration** — adding new chains requires bridge updates on all existing instances.

## **Natively Interoperable Apps (Fat Apps)**
With Polymer, we introduce interoperable contracts that enable—a simpler, more flexible way to build multi-chain applications that puts developers first.

### How interoperable contracts work 

![image](https://github.com/user-attachments/assets/54e41d66-1cb3-46b1-a0b6-accd32b3a7eb)

- **No contract interfaces needed** — emit standard application events.
    - Polymer supports **state-level proofs**, which allows proving any emitted event without requiring special contracts on the origin chain.
- **Single proof call** — execute your destination logic using `validateEvent` with proof from Prove API.
    - Polymer e2e latency is close to rollup block times i.e 2-4secs.
- **App defined API** — events retain their original format defined by the app developers.
    - Proof validation is hyper efficient with on-chain gas costs of under a cent.
- **Custom logic control** — execute your app-specific validations before processing.

With Polymer, developers can now treat interoperability as a byproduct of execution within your application contracts— not a separate architecture to manage.

#### Benefits of interoperable contracts 

- **Developer simplicity** — build faster, focus on core app logic.
- **Broadcast model** — emit once, prove anywhere.
- **No cross-chain boilerplate** — no need to re-configure contracts for every new chain.
- **Scalability** — as long as your contracts are deterministic, they are future-ready.
- **Permissionless Execution** — Anyone can submit a valid proof to trigger execution.
    - For enterprise security, additional access control layers can be implemented.
 
<br/>

## Use Cases

### ✅ Prove Actions Across Chains

- **Intent Settlement:** Prove that a user fill occurred (e.g., trade executed) before repaying solvers on the origin chain  (e.g., Eco, Catalyst).
- **Solver-Based Zaps:** Execute user-defined logic (like swaps or vault entry) fronted by solvers and proven via user-signed calldata (more fun with ERC-7702 and AI agents).
- **Decentralized Governance:** Enable token holders to vote on any chain and prove outcomes back to Ethereum for canonical result aggregation.

---

### 🔁 Synced Contract State

- **Lending Protocols:** Synchronize key yield-impacting events across chains to maintain consistent APY (e.g., RiftLend).
- **Yield Aggregators:** Consolidate yield across multiple chains into a single APY representation  (e.g., Superform) or expand from a single chain to others.
- **Treasury Sync:** Use for stablecoins or structured products to relay yield/treasury info to all chains without infrastructure duplication.

---

### 🌍 Build Once, Ship Everywhere

- **Oracle Feeds:** Serve data from a central chain and allow anyone to fetch and prove values on demand in seconds and control your own bottomline—without high messaging fees.
- **Optimistic Oracles:** Replace bridge-dependent deployments with single-chain proofs—e.g., proving UMA predictions across 100 chains without extra dev work.
- **Stablecoin Extensions:** Sync yield or treasury status without replicating backends across rollups.

---

### 🧑🏻‍💻 Advanced Use Cases

- **Batched Intent Settlement:** Prove multiple user intents in one go, drastically reducing settlement overhead for solvers.
- **Multi-Source Solving:** Aggregate funds from multiple chains to fulfill a single user operation and pay solver back on all chains with a single proof. (e.g., Resource-lock management in OneBalance)
- **Stringed Transactions:** Execute chain-dependent workflows (swap on A → swap on B → fallback to A if slippage fails) with proof-verified checkpoints. (e.g., Composability stack by Biconomy)
- **Modular Execution:** Offload compute-heavy matching or auctions to optimized chains (e.g., gather orders on Base, match on Solana, settle back on Base).  (e.g., Everclear)

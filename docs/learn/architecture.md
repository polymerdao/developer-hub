---
sidebar_position: 4
sidebar_label: 'Architecture'
---

# Architecture

At the core of **Polymer’s security model** is the aggregation of **rollup state (block headers)** onto a **publicly verifiable rollup**. Instead of relying solely on arbitrary cross-chain messaging, Polymer bundles entire block headers from multiple rollups into its L2, acting as the **meta-state** for all Ethereum rollups. This meta-state is then shared with connected rollups, allowing Polymer to provide a cryptographic source of truth for verifying **events**, **receipts**, and **storage slot** claims—**all within seconds.**

> Every rollup connected to Polymer maintains an always-updated awareness of the state of all other rollups within the network.  

### Why State (Block Headers)?
Block headers contain critical state information for a blockchain, including the Merkle Trie roots of all transactions, receipts, state, and previous block hashes. By relaying these instead of just messages, Polymer ensures that cross-chain interactions are cryptographically verified, rather than relying on trust-based relays.

### How Does Polymer Gather Rollup State?
Polymer directly sources block headers from rollup sequencers via their P2P gossip network (Sequencer Pre-Confirmations). This approach makes rollup state instantly available as soon as a block is produced—eliminating additional trusted intermediaries and ensuring real-time interoperability.

### Why Use a Dedicated Rollup for This?
Polymer itself is an OP-Go rollup purpose-built to bundle rollup headers efficiently. Verifying rollup states directly between chains point-to-point is expensive and not scalable. Instead, Polymer’s rollup consolidates this into a single, low-latency, verifiable database—where a single Polymer block header contains the state updates of all connected rollups. This header is then shared back to the whole network allowing dApps to prove any action cross-chain via this reference point.

Furthermore, this rollup can be used to perform transformations on top of the verified data. For example, it can parse application events and store them under a dedicated tree to reduce proof cost and size on EVM rollups, batch transactions from multiple chains into a single app-specific root, or even execute arbitrary computations—such as computing net payables to solvers after validating their fills. 

### **Trust Considerations**

When using Polymer’s Prove API for Ethereum proving, it’s important to understand the trust model and potential risks involved. Our system is designed to prioritize efficiency, and there are key aspects—like sequencer behavior and data availability—that we want to transparently address.

#### **Understanding the Trust Model for fetching Rollup State**

Polymer’s proving system depends on the rollup state provided by the sequencer, which introduces some trust considerations:

- **Sequencer Integrity:** We rely on the sequencer to deliver accurate and timely state updates before final confirmation. If the entity operating the sequencer (e.g., OP Labs) were to act dishonestly or censor transactions, it could impact the proving process.
- **Data Availability:** Fast confirmations hinge on the sequencer making data available. If a rollup stops submitting data batches to Ethereum, it might lead to a longer-term rreorg, which could temporarily disrupt proving.

For rollups without strong sequencer pre-confirmed blocks, we’ve partnering with Lit Protocol to enhance security:

- **Verifiable RPC Light-Client**: Lit Protocol uses a Trusted Execution Environment (TEE) network to cross-check block state from multiple reputed RPC providers. By verifying outputs this way, we reduce dependency on any single source and strengthen the light-client used in proving.

#### **Enhancing Polymer Rollup Security** 

To further reduce reliance on Polymer sequencer and bolster trust, we’re actively looking into migrating our rollup to a TEE. This shift brings significant improvements:

- **Validation Guarantees**: A TEE ensures the sequencer’s actions are verifiable and tamper-proof, offering greater confidence in the system.
- **Equivocation Guarantees**: It confirms that data availability (DA) submissions are accurate and can not be changed, preventing discrepancies.

Once complete, this migration will allow verifier nodes to independently reconstruct the full rollup state and validate our verifiable database of Ethereum meta-state. This is a major step forward in making the system more secure and remove any intermediary in verification process.

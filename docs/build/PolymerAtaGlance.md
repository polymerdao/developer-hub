---
sidebar_position: 1
sidebar_label: 'At A Glance'
---

# Polymer at a Glance

At the core of **Polymer’s security model** is the aggregation of **rollup state (block headers)** onto a **publicly verifiable rollup**. Instead of relying solely on arbitrary cross-chain messaging, Polymer bundles entire block headers from multiple rollups into its L2, acting as the **meta-state** for all Ethereum rollups. This meta-state is then shared with connected rollups, allowing Polymer to provide a cryptographic source of truth for verifying **events**, **receipts**, and **storage slot** claims—**all within seconds.**

> Every rollup connected to Polymer maintains an always-updated awareness of the state of all other rollups within the network.  

#### **Why State (Block Headers)?**

Block headers contain critical state information for a blockchain, including the Merkle Trie roots of all transactions, receipts, state, and previous block hashes. By relaying these instead of just messages, Polymer ensures that cross-chain interactions are cryptographically verified, rather than relying on trust-based relays.

#### **How Does Polymer Gather Rollup State?**

Polymer directly sources block headers from rollup sequencers via their P2P gossip network (Sequencer Pre-Confirmations). This approach makes rollup state instantly available as soon as a block is produced—eliminating additional trusted intermediaries and ensuring real-time interoperability.

#### **Why Use a Dedicated Rollup for This?**

Polymer itself is an OP-Go rollup purpose-built to bundle rollup headers efficiently. Verifying rollup states directly between chains point-to-point is expensive and not scalable. Instead, Polymer’s rollup consolidates this into a single, low-latency, verifiable database—where a single Polymer block header contains the state updates of all connected rollups. This header is then shared back to the whole network allowing dApps to prove any action cross-chain via this reference point.

Furthermore, this rollup can be used to perform transformations on top of the verified data. For example, it can parse application events and store them under a dedicated tree to reduce proof cost and size on EVM rollups, batch transactions from multiple chains into a single app-specific root, or even execute arbitrary computations—such as computing net payables to solvers after validating their fills. 

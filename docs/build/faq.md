---
sidebar_position: 9
sidebar_label: 'FAQ'
---

# Frequently Asked Questions (FAQ)

## 1. What is a transaction receipt, and how is it related to my event?
A **transaction receipt** is a record that details the outcome of a blockchain transaction. It includes the transaction’s status, gas used, logs, and a **logs bloom** (used for efficient log filtering). Each transaction on a chain has exactly one corresponding receipt, stored in a **Merkle trie** within the block’s state database.

While developers often rely on **contract events** for dApp functionality, events themselves aren’t permanently stored in the blockchain’s historical data. Instead, **transaction receipts** are used to prove the existence and authenticity of those events.

> **Learn more**  
> [Ethereum Data Transaction Receipt Trie and Logs Simplified](https://medium.com/coinmonks/ethereum-data-transaction-receipt-trie-and-logs-simplified-30e3ae8dc3cf)

---

## 2. What is the proof returned by the Prove API?
When building cross-chain applications, developers typically emit events on one chain and need to verify them on another. A **proof** is essentially a Merkle path that demonstrates a specific transaction receipt exists within a given block.

The Prove API returns a **superProof** containing two separate proofs:

1. A proof that the event exists within the source rollup.  
2. A proof that the source rollup’s state is valid inside the **Polymer rollup**.

This combination ensures you can verify an event emitted on one chain from within another chain.

> **Learn more**  
> - [How It Works: State (Polymer Labs Docs)](https://docs.polymerlabs.org/docs/learn/how-it-works/state)  
> - [Ethereum Data Transaction Trie Simplified](https://medium.com/coinmonks/ethereum-data-transaction-trie-simplified-795483ff3929)

---

## 3. What is the Polymer rollup, and what does it do?
**Polymer** is an Ethereum Layer 2 (L2) rollup. It connects to Ethereum (and other rollups) to fetch data about their latest states directly from each rollup’s sequencer. Instead of storing every transaction, Polymer stores **block headers** from various rollups—like a compressed summary of their states.

- Each rollup produces blocks containing transactions.  
- These blocks have **headers** that act like digital fingerprints (containing trie roots, transaction data, and block numbers).  
- Polymer “bundles” these headers and keeps them up-to-date in its own rollup header, which is then published across Ethereum.

This setup gives developers a **bird’s-eye view** of multiple rollups, allowing them to validate transactions on different chains from a single source of truth.

---

## 4. Why does the Prove API take time to respond?
Typically, the Prove API returns a proof in about **6–10 seconds**. This slight delay is intentional:

- **Proof generation** itself is straightforward, using publicly available data from the source and Polymer rollup.  
- **Polymer rollup** updates rollup states **lazily** (only when requested).  
- The delay ensures the latest rollup state is fully propagated to the destination chain before generating the final proof.

In short, the bottleneck is waiting for **rollup block times** to confirm that relevant state data is available and shared with the target chain.

---

## 5. Where is the proof generated, and where do I submit it? Also, what is the cost?
**Proof Generation**  
- Application contracts on source directly emit the event, no 3-party contract integration is required to emit events. Applications can now use their own Contract APIs cross-chain. 
- Proofs are built from **public data** by querying both the source rollup and Polymer rollup.  

**Proof Submission**  
- On the destination chain, include the proof as **call data** in the function you want to invoke.  
- Your application contract calls the **CrossL2Prover** contract to validate the proof.  
- Once verified, the proof reveals log details (like chain and contract of origin, event topics, and unindexed data).

**Costs**  
- You pay regular on-chain **gas fees** for the transaction that submits the proof to the destination chain.  
- There are no extra fees purely for generating the proof (beyond standard querying costs).

> **Learn more**  
> [Prover Contract Methods (Polymer Labs Docs)](https://docs.polymerlabs.org/docs/build/prove-api/prover-contract#methods)

---

## 6. Can I only prove the latest event, or can I also prove historic events?
Because Polymer is a rollup that continuously builds blocks and updates its state, proofs are most cost-effective for **recent** events. Currently, the Prove API provides proofs for the last **3–4 hours** for testing. Retrieving data from deeper in the rollup’s Merkle trie can become increasingly **expensive**.

For older (historic) data, you can store key information in contract storage, ensuring it persists in unique storage slots. The Prove API doesn’t currently support **storage proofs**, but this feature can be added relatively easily in the future if needed.


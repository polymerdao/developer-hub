---
sidebar_position: 3
sidebar_label: 'Proof Compression'
---

# Proof Compression

## Polymer superRoot and the magic of proof compression

Polymer ingests headers as part of its light-client updates and stores them in highly efficient data structures known as IAVL trees. These trees outperform Merkle Patricia Trees for proving by combining a balanced binary tree structure with efficient key-value lookups, enabling faster proof generation and verification.

Once stored in Polymer, these headers are bundled into a unified state called the superRoot, which is then gossiped to all rollups in the network.

:::info 

This superRoot enables anyone to validate a given rollup header in its state using the following path:

_“(Rollup Block to Validate) — IAVL Proof Path —> superRoot == True if Correct”_

:::


After validating the header, the header’s root can be used to perform a Merkle proof for receipts, logs, or storage that need verification.


:::info

The Prove API simplifies this entire process by preparing a two-level proof and returning it in one go, allowing app developers to easily validate the specific event or receipt they are interested in. This proof can be thought of as a superProof:

_“(Receipt to Validate) – MMPT proof → srcChain Block root – IAVL proof → superRoot”_

:::

Proofs can become large and contribute to call data overhead. However, since Polymer itself is a rollup, it can compress these proof sizes for greater efficiency. For example, Polymer can pre-prove receipts or events with MMPT proofs, committing them directly to the IAVL tree. This allows them to be accessed with a far more efficient IAVL proof.

![AD_4nXeI-clxXEMAEo8wgdHZZ9_BTpyEGPxH64NfUXMczK4M14oZIuha8IQbkxVhDdeHkaEohRXDdEs0LBwImllWLnoqrUO7cTZABALTTk9viEmpiMsmKX0iu448j0IYWalQAVev_NVc](https://github.com/user-attachments/assets/e31b8784-719b-43b0-b8d1-c2105278d26f)


Polymer enables batching of multiple events emitted by an application over time into a single IAVL proof. This approach can achieve up to 90% savings in call data size, dramatically improving efficiency for developer

### Off-chain data worker?
Tease, SoonTM

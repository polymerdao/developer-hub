---
sidebar_position: 0
sidebar_label: 'Leveraging State'
---

# Leveraging State

## Understanding this new interop primitive
Polymer extends the concept of rollups, much like how rollups efficiently batch user transactions and submit them to Ethereum for speed and scalability. Unlike traditional rollups that focus on transaction batching, Polymer bundles entire rollup states and propagates them across the network in real time.

This state-level approach ensures developers can verify any action done on-chain like events, and storage slots seamlessly, all while leveraging a unified proof system.

<img width="1147" alt="Screenshot 2024-12-19 at 8 02 48 AM" src="https://github.com/user-attachments/assets/1e138c39-7c2b-4027-bc49-62ec14e38512" />

1. **State updates via Light CXlients:** Polymer uses light clients to receive the latest rollup updates and stores them efficiently in IAVL trees. This enables lightweight verification and optimized state packing.
2. **Polymer’s State:** Once a block is built on Polymer, its state is gossiped across the network, propagating the most recent rollup updates.

_Polymer State as the SuperRoot_

Under the hood, the Polymer state acts as a superRoot for all connected rollups. It serves as a verification anchor for:
- **Rollup Block Headers:** Developers can use an IAVL proof to verify a rollup's block header (at any given height) is present within Polymer’s block.
- **Arbitrary On-chain Claim:** Once the block header is verified, developers can further prove the existence of specific receipts, events, or storage slots within the rollup block using a simple Merkle proof.

_“The **Prove API** streamlines the proof generation process by encapsulating the entire validation path, till the transaction receipt - like a **superProof**._
_This eliminates the need for developers to interact with multiple chains to construct these proofs, reducing complexity and overhead in cross-chain applications.”_

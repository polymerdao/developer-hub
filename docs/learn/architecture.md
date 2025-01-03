---
sidebar_position: 4
sidebar_label: 'Architecture'
---

# Architecture

## Polymer Protocol

Polymer Protocol is the first native interoperability protocol designed to deliver real-time speed at scale. By leveraging an OP-Go rollup and IBC primitives, Polymer enables seamless sharing of states across rollups:

- Utilizes light clients to receive the latest rollup state.
- Gossips rollup states across the network, empowering any rollup to verify external events, receipts, or storage slots.

This approach mirrors how rollups efficiently batch user transactions and submit them to Ethereum, ensuring both speed and scalability. Polymer builds on this paradigm by being a rollup that bundles rollup states and distributes it in real time.

### Security Meets Speed

Polymer Protocol leverages the robust P2P networks of rollups to read directly from the sequencer (pre-confirmations), granting instant access to the latest blocks and updates as they are produced. This seamless integration taps into the heart of rollup functionality, maintaining speed and reliability.

This flexibly extends to any rollup confirmation scheme, like TEE outputs, shared sequencers, and SP1 ZK clients. These state sources allow Polymer to balance latency and security effectively.

With this approach, rollup states are received and bundled in seconds, enabling real-time native interoperability. This drastically reduces latency compared to Ethereum’s finality or periodic state submissions, ensuring both speed and security.

<img width="887" alt="image" src="https://github.com/user-attachments/assets/91e275ee-bb40-4cde-8517-b7189028285b" />

## How sequencer pre-conf light clients work

Polymer Protocol utilizes the robust P2P networks of rollups to directly read from the sequencer (pre-confirmations). This allows instant access to the latest blocks and updates as they are produced, tapping into the core functionality of rollups while ensuring speed and reliability.

OP Stack rollups feature a well-defined P2P gossip network where the sequencer emits an `ExecutionPayloadEnvelope` ([reference](https://github.com/ethereum-optimism/optimism/blob/dcdf2b7693192f5bca0353bf22729f26c6240ea9/op-service/eth/types.go#L196)) containing the block header signed by the sequencer itself.

### Step 1: Source Rollup to Polymer

Polymer operates a P2P sentry that communicates with sequencers to fetch signed `ExecutionPayloads`. These payloads are stored as light-client updates and validated against the sequencer's signature. This process is repeated for each rollup in the network, effectively bundling rollup states into a unified system.

<img width="966" alt="image" src="https://github.com/user-attachments/assets/13e60249-7278-4571-8caf-27d0ebe3dc56" />

:::info NOTE

By having the entire header, Polymer’s unified state provides access to all on-chain claims, such as the receipt trie or the storage trie.

:::

### Step 2: Polymer to Destination Rollup

After Polymer Rollup builds its own block, it distributes the data further:

- **Propose on Ethereum:** Like any rollup, Polymer Hub posts its state on Ethereum. If an alternate state is proposed, it undergoes a dispute game.
- **Gossip to Other Rollups:** Using faster confirmations, Polymer can directly send state updates to other rollups in the network.

Every rollup proposes its state on Ethereum, signed by its sequencer. Polymer uses a similar method to update the client on destination rollups.

### Trust Considerations

This model relies on rollup state directly from the sequencer, inherently trusting the sequencer. Faster confirmations depend on the sequencer ensuring data availability.

- **Sequencer Risks:** The model fails if the entity running the sequencer (e.g., OP Labs) acts maliciously or censors transactions.
- **Data Availability Risks:** If a rollup ceases submitting data batches to Ethereum, it could lead to a long-term reorg.

To mitigate trust in Polymer’s sequencer, we are collaborating with Lagrange to provide zk-proofs of rollup states derived from Ethereum-posted data.


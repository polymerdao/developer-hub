---
sidebar_position: 1
sidebar_label: 'Overview'
---

# Polymer Hub: Connecting Ethereum Rollups through State Sharing

Polymer Hub is a networking protocol that connects Ethereum rollups by sharing state updates between them. Similar to the Inter-Blockchain Communication (IBC) protocol, it allows rollups to receive light client updates from one another. By facilitating state exchange, Polymer Hub enables rollups to verify event logs from other chains.

:::info

Polymer Hub gathers state from source rollups using a light-client approach, differing from systems that work on a per-packet basis signed by multisigs.

:::

## Sequencer Client

Our flagship offering is the Sequencer Client, which reads rollup state directly from the rollups’ sequencer, aggregates it on Polymer Hub, and sends a single state update to the destination chain to account for all the rollups and transactions on them.

![image (32)](https://github.com/user-attachments/assets/16272602-3926-4d53-a9ca-93cf4b9d1072)

**Key Features:**

- **First-Party Security:** The Sequencer Client reads the rollup state by tapping into the P2P gossip network of rollups—the source of all state changes on a rollup—as soon as a block is generated.
- **Real-Time Communication (< 1 min):** Rollups communicating through Polymer Hub can verify events nearly instantly. The speed depends how fast each rollup is configured. Polymer Hub will operate similar speed to each rollup.
- **Ethereum Fork Consistency Checks:** The client performs dual checks—not only for verification guarantees but also to ensure that communicating rollups are on the same L1 (canonical fork of Ethereum). This allows for fast latency without the need for arbitrary confirmations.

:::info

By leveraging the Sequencer Client and Polymer Hub's architecture, developers can achieve secure, and real-time cross-rollup communication while maintaining consistency with the Ethereum mainnet.

:::


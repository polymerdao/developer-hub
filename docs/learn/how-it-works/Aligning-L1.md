---
sidebar_position: 5
sidebar_label: 'Aligning to L1'
---


# Reconsidering Interoperability: Aligning L1 Origins for Fairness and Speed

Current interoperability solutions have not fully addressed the complexities of blockchain finality. In an effort to enhance user experience, they have prioritized speed, potentially at the cost of security by overlooking the importance of finality in rollup transactions. 

Concepts like "confirmations on rollups" can be misleading, as they do not always account for the unique characteristics of rollups and their relationship to the Ethereum mainnet.

For application-specific rollups to work closely with others or to share their state effectively, developers need to be educated about the importance of **L1 origins ([RIP-7789](https://ethereum-magicians.org/t/rip-7789-cross-rollup-contingent-transactions/21402))** is a step towards it). By choosing L1 origins that are closer to those of their counterpart rollups, they can minimize finality gaps. This alignment not only enhances speed but also ensures that interactions respect each rollup's configuration and the underlying Ethereum protocol.

By being mindful of L1 origins, rollup developers can:

- **Reduce Latency:** Aligning L1 origins decreases the wait time required for finality checks between rollups.
- **Enhance Security:** Ensuring that rollups follow the same Ethereum view mitigates the risks associated with forks and reorgs.
- **Improve Interoperability:** Educated choices about L1 origins facilitate smoother and more reliable cross-chain communications.

In essence, a fair and efficient interoperable ecosystem requires developers to understand and respect the foundational elements of blockchain finality. It's not just about making things faster; it's about making them right.

---
sidebar_position: 0
sidebar_label: 'Features'
---

# Polymer Hub Features

:::info Polymer Hub’s feature set includes but is not limited to:

 1. Speed (~10-50 seconds)
 2. 1st party security standards (Rollup grade)
 3. Ethereum fork protected w/ on-chain validation

:::

Polymer Hub is a networking protocol that connects Ethereum rollups by sharing state updates among them. Polymer Hub utilizes IBC primitives, where a blockchain receives light client updates from a counterparty chain. Polymer Hub empowers rollups to verify any event emitted on any other chain through light client updates.

![image (42)](https://github.com/user-attachments/assets/6453a27c-eae8-4c4c-b339-7c00a4d709fd)

Polymer Hub aggregates external rollup events into a single state commitment that can be proven on all external chains. This allows dapps to prove external events against a unified state without the trust assumptions of a centralized bridge or relayer. 

:::tip State Aggregation

Polymer Hub gathers state from source rollups using a light-client approach, differing from systems that work on a per-packet basis signed by multisigs.

:::
<br/>
The interoperability space within the Ethereum ecosystem is full of tradeoffs, and recently, it has mostly come down to speed vs security. Polymer aims to debunk that.

## Polymer Hub is Real-Time (Fast)
When being able to read directly from a rollup’s sequencer, it enables Polymer Hub to be as fast as a given chain can operate (real-time). Meaning Polymer Hub can send messages as fast as they are produced on the rollups (seconds). It’s immediately reading from the sequencer, the very engine that propels each rollup.

## First Party Security Standards
This is an issue handled by most interop protocols today by using different third party security standards:

| Source of Truth          | Verification Type | Description |
| ------------------------ | ------------------------ | ------------------------ |
| 1st party    | Ethereum | Relies on Ethereum state as the security |
| 1st party    | Rollup Infra | Rollup infra equated to sequencer, node or a shared layer of the rollup |
| 3rd party    | Staked Multisig / PoS | Validators or AVSs committee style attestation services that have economic bond to prevent misbehavior |
| 3rd party    | Multisig | A standalone multi party signature scheme with no economic stake for misbehavior |
| 3rd party    | PoA | Trusted setup, where the party relaying and securing the message are close and likely the same |


**1st party source is where the information is generated vs 3rd party verification is when an external party is giving that info*

Polymer Hub is the first protocol to leverage 1st party standards due to its design of being a rollup itself. In other words, Polymer Hub does not depend on additional trust assumptions offchain. Instead, it leverages the same security of the chains it is built on, such as the sequencers that control ordering and validity for each rollup.


## Ethereum Fork Protected
Polymer Hub also ensures that the transactions in a given L2 block are mapped against a consistent L1 (Ethereum) view, ensuring that both transactions will either succeed or fail together. This is incredibly important in the case of a re-org with non-finalized transactions, making Polymer re-org resistant for all transactions. Polymer is the first protocol to offer this at subfinality levels (Block creation < 20 mins).

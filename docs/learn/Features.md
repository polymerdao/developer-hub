---
sidebar_position: 0
sidebar_label: 'Features'
---

# Polymer Hub Features

:::info

Polymer Hub’s feature set includes but not limited to:
 1. Speed (~10-50 seconds)
 2. 1st party security standards
 3. Ethereum fork protected w/ on-chain validation

:::

The interop space, within the Ethereum landscape, is full of tradeoffs and recently it has mostly come down to speed vs security. Polymer aims to debunk that.

## Polymer Hub is Real-Time (Fast)
When being able to read directly from a rollup’s sequencer, it enables Polymer Hub to be as fast as a given chain can operate (real-time). Meaning Polymer Hub can send messages as fast as they are produced on the rollups (seconds). It’s immediately reading from the sequencer, the very engine that propels each rollup.

## First Party Security Standards
This is an issue handled by most interop protocols today by using different third party security standards:



*1st party source is where the information is generated vs 3rd party verification is when an external party is giving that info*

Polymer Hub is the first protocol to leverage 1st party standards due to its design of being a rollup itself. In other words, Polymer Hub does not depend on additional trust assumptions offchain. Instead it leverages the same security of the chains it is built on, such as the sequencers that control ordering and validity for each rollup.


## Ethereum Fork Protected
Polymer Hub also ensures that the transactions in a given L2 block are mapped against a consistent L1 (Ethereum) view ensuring that both transactions will either succeed or fail together. This is incredibly important in the case of a re-org with non finalized transactions. Making Polymer re-org resistant for all transactions. Polymer is the first protocol to offer this at subfinality levels (Block creation <20 mins).

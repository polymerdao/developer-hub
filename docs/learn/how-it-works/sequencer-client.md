---
sidebar_position: 2
sidebar_label: 'Sequencer Pre-Conf Client'
---


# Sequencer Pre- Confirmation Client

The fastest way to read the state of a rollup is to track it at the sequencer level. OP Stack rollups have a well-defined P2P gossip network where the sequencer emits an `ExecutionPayloadEnvelope` ([reference](https://github.com/ethereum-optimism/optimism/blob/dcdf2b7693192f5bca0353bf22729f26c6240ea9/op-service/eth/types.go#L196)), which contains the block header signed by the sequencer itself.

## Step 1: Source Rollup to Polymer Hub
Polymer runs a P2P sentry to fetch these payloads emitted by the sequencer. Polymer Hub stores the entire headers as client updates (validated against the sequencer's signature), effectively acting as a state aggregator of all connected rollups.
![image (33)](https://github.com/user-attachments/assets/949a0a91-fae2-4cf9-ba4c-7d8b19e3c716)

### Connecting State to Ethereum
This introduces **the concept of “sub-finality”**, which acts as a proxy for block safety (i.e., safe, finalized blocks that are only a function of Data Availability (DA) submissions), we take it a step further. 

Every rollup is anchored to a given Ethereum block with a defined number of confirmations; this block is known as the `L1Origin` (i.e from a certain depth from the L1 head), defined in the rollup's derivation pipeline.

We use this to tie every rollup's state update back to the L1Origin it is following. This ensures that communicating rollups are on the same fork of Ethereum, reducing the chances of relaying state that is likely to reorg.

## Step 2: Polymer Hub to Desination Rollup
Once Polymer Hub's state is ready and a block is built, it can:

- **Propose on Ethereum:** Like any rollup, Polymer Hub posts its state on Ethereum. This process will follow a dispute game if someone proposes an alternate state.
- **Forward to Other Rollups:** Using faster confirmations, it can send state updates directly to other rollups.

Every rollup proposes a state on Ethereum, signed by its sequencer. We follow a similar approach to update the client on the destination chain.

<br/>

### Consistency Check
Once the Polymer Hub client update reaches the destination chain, it must pass both the validity check (L2 level) and the consistency check (L1 level) to be accepted.
![image (34)](https://github.com/user-attachments/assets/3d89c9b9-c02a-44ea-a51d-e0a2f1f98bd5)

In case a rollup is following the wrong fork of Ethereum or has undergone a reorg (reverting transactions to the mempool), the client update will fail. Any packets sent from the source chain with a different L1 view will not pass if the transactions are replayed by the rollup.

![image (35)](https://github.com/user-attachments/assets/96bfe2d8-f64c-46dd-b392-1a4edc5ccc0a)

Polymer Labs has contributed a Rollup Improvement Proposal, RIP-7789, discussing the importance of L1Origin and the role it plays in rollup communications. Read more about [RIP-7789](https://ethereum-magicians.org/t/rip-7789-cross-rollup-contingent-transactions/21402).


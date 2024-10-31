---
sidebar_position: 3
sidebar_label: 'Uniting Rollup (Block)space'
---

# The Space-Time Gap Between Rollups

Since every rollup block is anchored to a specific Ethereum block at a configurable depth—this block is known as the L1 origin. Depending on the L1 origin or L1 history that the L2 is derived from, the L2 block is technically produced sometime in the past as it’s generally the sum of both historical L1 and current L2 inputs.

Consider the following example:

![image](https://github.com/user-attachments/assets/45dbb5ac-67d1-4035-bc2b-049c9f538178)

* **Arbitrum**: Suppose the latest Arbitrum block is built off Ethereum block number **75**.  
* **Base**: The latest Base block might be built off Ethereum block number **135**, but an older Base block could have been built off block number **75**.

In this scenario:

* The latest Arbitrum block has no knowledge of Ethereum blocks beyond block 75, which might include blocks that other rollups like Base and Optimism are building their latest blocks on.  
* Conversely, Base lacks information about the latest blocks of Optimism, but it does have knowledge of Arbitrum's latest L1 orgin since it has already processed Ethereum block 75\.

This means that depending on their L1 origins, different L2s might be operating with different views of the Ethereum chain. They are either "in the past", “in the future” or "in the same time" relative to one another depending on where they are anchored in the L1 history.

## Uniting Ethereum Blockspace 

To ensure that rollups communicating within the finality gap are on the correct fork of Ethereum, Polymer Hub operates as a rollup on Ethereum itself. Being a rollup allows it to be directly connected to both Ethereum and other rollups, ensuring consistency and alignment across the network.

![image (29)](https://github.com/user-attachments/assets/41881778-2fe7-41e2-99ef-4e8cf15413d0)
- Rollups A, B and C will be allowed to communicate with each other in real time.
- Any communications sent from a rollup at a future (lower depth) should not be instantly sent to a rollup at a greater depth (past).
- But any state updates going to B to A’ will fail the Ethereum consistency check as A’ is on a different fork. The same is true with B’ trying to communicate with others.

This design addresses the challenges posed by the finality gap and fosters a more unified rollup ecosystem.


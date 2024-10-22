---
sidebar_position: 3
sidebar_label: 'Ethereum as Truth of Source'
---

# The Space-Time Gap Between Rollups
![image (25)](https://github.com/user-attachments/assets/2f9fef63-53ce-43af-b6ef-72ecb76e5367)

<br/>

Rollups anchor themselves to Ethereum at specific points on the blockchain known as **L1Origin**. Depending on their L1Origin, rollups can be at different places on Ethereum's timeline. In the worst-case scenario, they might even be following a different fork of Ethereum entirely.

<br/>

This situation has important implications:

- **State Dependency on Ethereum's View**: Each rollup's state is contingent upon the Ethereum chain it follows. Since Ethereum achieves finality after about 13 minutes (two epochs), the chain a rollup follows might not be the finalized one. This means the rollup's state is provisional until Ethereum finalizes its chain.
- **Risk of Reorganizations (Reorgs)**: If rollups are anchored to different forks of Ethereum, at least one will be following a non-canonical chain. When Ethereum finalizes its correct (canonical) chain, rollups on the wrong fork will have to reorganize their blockspace to align with the finalized chain. Transactions processed on the incorrect fork will be reverted and need to be re-executed on the correct timeline.

<br/>

Because rollups are tied to specific state of Ethereum they follow (as defined in their native bridge contracts), there's an inherent **gap** between them. This gap arises due to Ethereum's finality period—the time it takes for blocks to become immutable (approximately 13 minutes). Until finality is reached, rollups may not be perfectly synchronized.

:::tip

By understanding this space-time gap, we recognize that the interoperability between rollups is affected by:

- **Ethereum's Finality Lag**: The delay before blocks are finalized introduces temporal separation between rollups.
- **Potential Forks and Reorgs**: Rollups following non-finalized or incorrect Ethereum forks risk significant reorganization of their blockspace.

This gap emphasizes the importance of considering Ethereum's finality in rollup design and interoperability solutions, as it directly impacts the reliability of rollup states.

:::

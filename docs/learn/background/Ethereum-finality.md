---
sidebar_position: 1
sidebar_label: 'Ethereum Finality'
---

# Ethereum's Finality

:::info State Management

For context of the sacred timeline, see [here](https://www.tumblr.com/rekaspbrak/661582984296775680/adorablelokie-how-does-the-sacred-timeline-and)

:::

## Ethereum: The Sacred Timeline of Finality

![image (31)](https://github.com/user-attachments/assets/7fb13a23-d185-4b85-b277-5c04ecf949fc)
<br/>
<br/>
Ethereum's rollup-centric roadmap aims to scale the usability of its decentralized and secure blockspace, bolstered by significant staking. While this approach enhances security and inclusivity (like solo stakers), it encounters a **finality problem**.

### Finality of Ordering
Ethereum operates on a probabilistic model where transactions aren't fully confirmed until after two epochs—approximately 13 minutes under normal network conditions. Until this finality is reached:

![image (21)](https://github.com/user-attachments/assets/66ca59e3-377f-4bb8-a7db-512bf56526f5)

- **Forks May Occur**: Ethereum can have different forks based on the transactions included in a block, leading to diverging views
- **Delayed Confirmations**: It can take significant time to finalize transactions (horizontal relationship to finality).

Thus, the primary settlement layer for rollups requires about 13 minutes to achieve finality, prompting the question: **How do rollups ensure they align with Ethereum's timeline?**

:::tip

These factors are typically defined in the native bridge of a rollup at the time of deployment.

:::

# Rollups and Ethereum Security
Rollups scale Ethereum by offloading execution overhead to an off-chain sequencer while inheriting Ethereum's security. They achieve this by:
1. **Tracking Ethereum's Timeline:**
   ![image (22)](https://github.com/user-attachments/assets/430b88f9-c72a-4686-ba68-6313ba8347dc)
   - Each rollup block associates with a corresponding Ethereum L1 block (known as **L1Origin**).
   - The L1Origin can be at various depths on Ethereum's timeline, even on a fork.
   - This is also how users bridge funds to the rollup via the native bridge, entering the off-chain environment, or force include transactions.
   - *In the example image above Base has already seen the L1 block Arbitrum is using as it’s L1Origin since it is further in depth. However, Base is unaware Optimism as it is too early in depth.*
2. **Sequencer Posting Transactions to L1 (DA):**
   - The sequencer batches transactions (ordered) and posts them on L1 for data availability.
   - Ethereum takes it own time to finalizes this batch transaction (containing the ordering), ensuring the sequencer cannot alter transaction ordering in future, reducing the need for trust.
3. **Proposing the Rollup State Root to L1**:
    - The rollup computes the state root by executing transactions from the posted data batches, and then proposes it on Ethereum.
    - A challenge window (typically 7 days) begins, allowing anyone to submit a fault proof.
    - Users experience a 7-day exit delay due to this challenge window.



# Rollup's Relationship to Ethereum Timeline
Every rollup anchors to Ethereum via its L1Origin, defining its position on the timeline. The depth at which a rollup follows Ethereum matters:
![image (23)](https://github.com/user-attachments/assets/eb0b3d03-ceae-4605-a8ec-0fc44de4fd33)

- **Shallow Depth** (e.g., Optimism at 4 blocks):
    - Less delay but higher risk if Ethereum forks.
- **Greater Depth**:
    - More confirmations reduce the risk of following a forked timeline.

### Consequences of Tracking the Wrong Timeline
![image (24)](https://github.com/user-attachments/assets/dcfc4956-277b-4b63-b3c2-eb87a75c4d37)

If a rollup follows an incorrect Ethereum fork:
- The rollup must switch to the correct timeline upon Ethereum's finalization.
- Transactions executed on the wrong timeline revert to the mempool.
- The sequencer replays these transactions; failure to catch up may lead to state reversion i.e a reorg as seen in the 2-week reorg on Degen Chain.

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


# Nexus of 1000s of Rollups
![image (26)](https://github.com/user-attachments/assets/212a09ed-cb40-4772-83ba-1f4b6ff9f3df)

With over 200 rollups and growing, tracking each rollup's alignment with Ethereum is becoming complex. Although Ethereum rarely experiences deep reorgs (typically up to 2 blocks and max seen upto 7 blocks), even minor discrepancies can disrupt closely following rollups.

Bringing rollups closer in blockspace is crucial, especially as transaction times decrease (e.g., milliseconds for rollups like MegaETH). High finality gap between rollups hinders application development, forcing new rollups to repeatedly deploy the same primitives instead of focusing on specialized use cases.

<br/>

## Polymer Hub: Uniting Ethereum Rollup Blockspace
![image (27)](https://github.com/user-attachments/assets/a308085f-c29d-4c21-bf19-e46f05ac9d92)

Polymer Hub is a networking protocol designed to connect Ethereum rollups by sharing state updates between them. This mechanism is similar to the IBC protocol, where a blockchain receives light client updates from a counterpart chain. By facilitating the exchange of state updates, Polymer Hub enables rollups to verify any event log on any other chain.

![image (28)](https://github.com/user-attachments/assets/ee47758e-2dcb-427e-8c9d-bc7502ba5f9b)

To ensure that rollups communicating within the finality gap are on the correct fork of Ethereum, Polymer Hub operates as a rollup on Ethereum itself. Being a rollup allows it to be directly connected to both Ethereum and other rollups, ensuring consistency and alignment across the network.

![image (29)](https://github.com/user-attachments/assets/41881778-2fe7-41e2-99ef-4e8cf15413d0)
- Rollups A, B and C will be allowed to communicate with each other in real time.
- But any state updates going to B to A’ will fail the Ethereum consistency check as A’ is on a different fork. The same is true with B’ trying to communicate with others.

This design addresses the challenges posed by the finality gap and fosters a more unified rollup ecosystem.

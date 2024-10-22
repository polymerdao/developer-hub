---
sidebar_position: 2
sidebar_label: 'Rollups and Ethereum Security'
---

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

## Rollup's Relationship to Ethereum Timeline
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

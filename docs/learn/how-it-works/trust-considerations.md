---
sidebar_position: 3
sidebar_label: 'Trust Considerations'
---


# Trust Considerations

Since this model reads rollup state directly from the sequencer, there is an inherent trust in the sequencer. Transacting on a rollup offers faster confirmations if the sequencer ensures data availability.

- **Sequencer Risks:** If we are reading state from Optimism, the model only breaks if OP Labs (the entity running the sequencer) acts maliciously or starts censoring transactions.
- **Data Availability Risks:** If the rollup stops submitting data batches on Ethereum, it could result in a long-term reorg (future reorg).

The same trust assumptions apply to Polymer Hub's sequencer. To remove trust in the Polymer Hub sequencer, we are working with **Lagrange** to provide **zk-proofs** of the rollup state (derived from the data posted on Ethereum). This will increase latency from a few seconds to around 20 minutes.

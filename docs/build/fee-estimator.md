---
sidebar_position: 5
sidebar_label: 'Fee Estimator'
---

# Fee Estimation

The vibc protocol is permissionless for channel and packet proof verification and commitment storage. However, a relayer must relay transactions between the source and destination chains. To ease the burden of relaying, Polymer operates an automatic relay which handles relaying the channel and packet handshake steps across the source, destination, and peptide chains.

To use Polymer's relayer, users must send fees that offset the gas costs on source, destination, and peptide chains.

- Fees are paid in the source chains native gas token.
- Fees cover the subsequent transactions and their execution, i.e the Recv Tx on destination and Ack Tx back on the source chain (if the application chooses Acknowledgments).
- Fees should be sent to the FeeVault contract on the source chain.

For example, for sending a packet or opening a chanel from from Optimism to Base chains, fees should be sent in optimism ETH through calling the  `depositSendPacketFee`  or    `depositOpenChannelFee`.  Sending insufficient fees will result in packets or channels (at any step of the handshakes) to not being relayed by Polymer.

:::tip

Fees should never be sent directly to the feeVault. They should only be deposited through defined methods.

:::

## Fee Estimator API[](https://docs.polymerlabs.org/docs/build/ibc-solidity/fee-estimator#fee-estimator-api)

To account for fluctuating gas prices, it's recommended to always query the gas prices to send via the [Gas limit api](https://docs.polymerlabs.org/docs/build/ibc-solidity/fee-estimator#fee-estimation).

More detailed docs on how to use the Fee Estimator API [are here](https://fee.polymer.zone/api-docs/).

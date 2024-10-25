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

For example, for sending a packet or opening a chanel from from Optimism to Base chains, fees should be sent in optimism ETH through calling the  `depositSendPacketFee`  or    `depositOpenChannelFee`.  Sending insufficient fees will result in packets or channels (at any step of the handshakes) to not being relayed by Polymer.

:::danger

Fees should never be sent directly to the feeVault. They should only be deposited through defined methods.

:::

## Fee Estimator API[](https://docs.polymerlabs.org/docs/build/ibc-solidity/fee-estimator#fee-estimator-api)

To account for fluctuating gas prices, it's recommended to always query the gas prices to send via the [Gas limit api](https://docs.polymerlabs.org/docs/build/ibc-solidity/fee-estimator#fee-estimation).

More detailed docs on how to use the Fee Estimator API [are here](https://fee.polymer.zone/api-docs/).

### Querying FeeVault address
Since it's possible this FeeVault contract can be updated in the future, it's recommended to always query the FeeVault address from the Dispatcher contract through the `dispatcher.feeVault()` method. Refer to the example `_depositSendPacketFee` and `_depositOpenChannelFee` implementations in the abstract FeeSender contract. 

It's important to note: 
- Any fees directly sent to the FeeVault contract will not be credited to the packet or channel. Use the provided `depositSendPacketFee` and `depositOpenChannelFee` methods instead.
- These methods will revert if the total value sent in the transaction  doesn't *exactly* add up to the total gasPrices*gasLimits. This is done to simplify accounting, avoid fee griefing and also to protect users from sending accidentally too many fees.
- Though the example contracts call these methods from a dapp, feeVault methods are permissionless for any packet and channel, and can also be called by EOAs directly
- All fee deposits are final and cannot be withdrawn

## Fee estimation
Before calling the `depositSendPacketFee` or `depositOpenChannelFee` methods, users must estimate the fees to send. This can be done through the FeeEstimator API. 

For both channel and packet handshakes, this api serves:
- An `/estimateGas` endpoint, where users pass in gasLimits and are returned the gasPrices to send to the feeVault contract 
- A `/estimateDynamicGas` endpoint, where a packet's gasLimits are estimated using the `eth_estimateGas` gRPC endpoint, and returned by the api. Note: this api shouldn't be used for contracts where the gas estimation is time dependent or vary's widely with time as it can result in inaccurate fee estimation.


## Fee Specifics for Channels vs Packet Handshake
There's a few specifics to sending packet fees vs channel fees:

### Channel Fees

Given their complexity and relative infrequency, fees for channel handshakes are collected in a single lump sump. This amount is to be negotiated with the Polymer team by dapp which is opening the channel. 

Note: The Universal Channel for each chain pair can be used to send messages without having to do the channel handshake, and thus to avoid having to send channel handshake fees. 

### Packet Fees

Since the first step of the packet handshake (calling sendPacket on the source chain) is initiated by the user dapp and not the relayer, the fees for the first step do not need to be sent to the fee vault. Thus, even though the sendPacket handshake has 3 steps, the user only needs to deposit fees to the FeeVault for the latter two steps:

- calling `dispatcher.recvPacket` on the destination chain
- calling `dispatcher.acknowledge` on the source chain

For both of these calls, 2 values each must be sent to the FeeVault contract:
- gasLimit: The estimated gas for the transaction
- gasPrice: The gasPrice for the transaction. For non-legacy transactions, this is equivalent to the maxFeePerGas.  

These 4 values (i.e. gasLimit and gasPrice for both the send and recv packet steps) are encoded as 2 arguments sent in the depositSendPacketFee method. The `gasLimits` argument is a 2 element array, where the first element is the gas limit for the recvPacket call, and the second element is the gas limit for the acknowledge call. The `gasPrices` is a 2 element array, where the first element is the gas price for the recvPacket call, and the second element is the gas price for the acknowledge call.

Note: A call to the FeeVault contract will revert if the total value sent in the transaction's `msg.value` doesn't *exactly* add up to the total (gasLimits[0]*gasPrices[0] + gasLimits[1] * gasPrices[1]). 

Since the gasPrices are padded with a margin to account for fluctuating gas prices, it's recommended to always query the fee estimator asi for most up-to-date gas prices.

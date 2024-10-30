---
sidebar_position: 4
sidebar_label: 'Default Message Flow'
---

# Speed Run Rollup IBC with Universal Channels 

Universal channel is like an open port already deployed by Polymer to allow anyone to call a remote contracts. This contract is known as Universal channel handler (UCH), so instead of calling the dispatcher your application will be calling this contract to quickly send over an executing message. 

- On the sender side, the Universal Channel Handler will package the Universal Packet into a regular SendPacket (as if it were a normal packet) and send it over the channel it owns (the universal channel).
- On the receiver side, another UCH processes the regular IBC packet to extract the universal packet. It then forwards this universal packet to the specified destination as per the  `UniversalPacket.destPortAddress` field.

:::tip

Making use of a universal channel can be an excellent way to onboard onto Rollup IBC for new developers. At the same time, application should not use it for production ready use-cases, as many applications share the same channel, and can thus get our Dispatcher contract to call the permissioned packet handlers. It is therefore recommended to always authenticate both the universal channel and the remote sender for packets sent over UCH. 

:::

## Deploying your Receiving contract 

To be able to receive a packet, you need to implement the  [`IbcUniversalPacketReceiver`](https://github.com/open-ibc/vibc-core-smart-contracts/tree/main/contracts/interfaces/IbcMiddleware.sol#L76)  interface in your contract. This function is called by the UCH when a packet is received.

Here is an example receiving function from [Earth demo contract:](https://github.com/open-ibc/vibc-core-smart-contracts/blob/b50844c6925d6780d110bbddb3c47d0797f57c7a/contracts/examples/Earth.sol#L108) 

Notice that you need to now inherit the [IbcUniversalPacketReceiverBase abstract contract](https://github.com/open-ibc/vibc-core-smart-contracts/blob/b50844c6925d6780d110bbddb3c47d0797f57c7a/contracts/interfaces/IbcMiddleware.sol#L317) instead of `IbcPacketReceiver`. 

```solidity
/**
     * @notice Handles the recv callback of a universal packet.
     * @param channelId The channel ID.
     * @param packet The universal packet.
     * @return ackPacket The acknowledgement packet.
     * @return skipAck Whether to skip the writeAck event.
     * @dev It's recommended to always validate the authorized channel of any packet or channel using the
     * onlyAuthorizedChannel modifier.
     */
    function onRecvUniversalPacket(bytes32 channelId, UniversalPacket calldata packet)
        external
        onlyUCH
        onlyAuthorizedChannel(channelId)
        returns (AckPacket memory ackPacket, bool skipAck)
    {
        recvedPackets.push(UcPacketWithChannel(channelId, packet));
        return (this.generateAckPacket(channelId, IbcUtils.toAddress(packet.srcPortAddr), packet.appData), false);
    }
```

## Sending a Universal Packet

Once you have deployed your contract, you can now call `sendUniversalPacketWithFee` from the [Universal channel handler](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/core/UniversalChannelHandler.sol) on the source chain of your liking. (You can find UCH addresses here for [testnet](https://github.com/polymerdao/polymer-registry/blob/testnet/dist/output.json) and [here](https://github.com/polymerdao/polymer-registry/blob/mainnet/dist/output.json) for mainnet)

This function takes four arguments:

- `channelId`: The ID of the channel you want to send the packet over, encoded as utf8 bytes. This should usually correspond to a universal channel you fetch from the polymer registry.
- `destPortAddr`: The address of the destination contract you just deployed. This sholuld usually correspond to a UCH address you fetch from the polymer registry.
- `appData`: The data payload specific to your dApps.
- `timeoutTimestamp`: The timestamp in nanoseconds at which the packet should timeout on destination chain.
- gasLimits: An array containing two gas limit values: gasLimits[0] for `recvPacket` fees, and gasLimits[1] for `ackPacket` fees.
- gasPrices: An array containing two gas price values: gasPrices[0] for`recvPacket` fees, for the dest chain, and gasPrices[1] for `ackPacket` fees, for the src chain

Submitting a transaction to trigger Universal Packet:

```solidity
// first, get the Universal Channel Handler contract address on desired source
IbcUniversalPacketSender uc = IbcUniversalPacketSender(0x1234567890...);
// get `channelId` from Polymer registry that represents a unidirectional path from the running chain to a destination chain, from the running's perspective
uc.sendUniversalPacketWithFee(channelId, destPortAddr, appData, timeoutTimestamp);
```

Here is the interface for reference:  

```solidity
/**
     * @notice Sends a universal packet over an IBC channel, and deposits relaying fees to a FeeVault within the same
     * tx.
     * @param channelId The channel ID through which the packet is sent on the dispatcher
     * @param destPortAddr The destination port address
     * @param appData The packet data to be sent
     * @param timeoutTimestamp of when the packet can timeout
     * @param gasLimits An array containing two gas limit values:
     *                  - gasLimits[0] for `recvPacket` fees
     *                  - gasLimits[1] for `ackPacket` fees.
     * @param gasPrices An array containing two gas price values:
     *                  - gasPrices[0] for `recvPacket` fees, for the dest chain
     *                  - gasPrices[1] for `ackPacket` fees, for the src chain
     * @notice The total fees sent in the msg.value should be equal to the total gasLimits[0] * gasPrices[0] +
     * gasLimits[1] * gasPrices[1]. The transaction will revert if a higher or lower value is sent
     * @notice if you are relaying your own transactions, you should not call this method, and instead call
     * sendUniversalPacket
     * @notice Use the Polymer fee estimation api to get the required fees to ensure that enough fees are sent.
     */
    function sendUniversalPacketWithFee(
        bytes32 channelId,
        bytes32 destPortAddr,
        bytes calldata appData,
        uint64 timeoutTimestamp,
        uint256[2] calldata gasLimits,
        uint256[2] calldata gasPrices
    ) external payable returns (uint64 sequence) {
        // Cache dispatcher for gas savings
        IbcDispatcher _dispatcher = dispatcher;

        bytes memory packetData = IbcUtils.toUniversalPacketBytes(
            UniversalPacket(IbcUtils.toBytes32(msg.sender), MW_ID, destPortAddr, appData)
        );
        emit UCHPacketSent(msg.sender, destPortAddr);
        sequence = _dispatcher.sendPacket(channelId, packetData, timeoutTimestamp);
        _depositSendPacketFee(dispatcher, channelId, sequence, gasLimits, gasPrices);
    }
```

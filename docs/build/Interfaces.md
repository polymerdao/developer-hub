---
sidebar_position: 2
sidebar_label: 'Interfaces'
---

# Intro to Polymer Hub Interfaces

## Sending a Packet

To send a message or packet, you will call the `SendPacket` method via the [dispatcher contract](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/interfaces/IbcDispatcher.sol) **on the chain you are sending the packet from.** Following is the event you will see on your explorer, if you are able to submit a successful transaction.

![image (46)](https://github.com/user-attachments/assets/e3df9dcb-3f43-46ed-bbb2-f9996bb019fa)


If you don't see a successful `SendPacketEvent` and instead see a reverted tx , the following could have gone wrong:

- You don't own the channel you are attempting to send a packet over (the Dispatcher contract enforces that only channel owners can send packets over a given channel). Make sure you have done a successful channel handshake before you attempt to send a packet over the channel.
- You can always call `dispatcher.GetChannel(portAddress, channelId)` to query if your dapp owns the channel on a given chain.
- The packet has already been sent for the given sequence number - try incrementing the sequence number to one you haven't used!
- Your timeout might be invalid - is it one in the past?

Calling `sendPacket` on our dispatcher contract, followed by `_depositSendPacketFee`, which is available through inheriting from our [FeeSender](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/implementation_templates/FeeSender.sol) contract. 

Following is an example from our [Mars](https://github.com/open-ibc/vibc-core-smart-contracts/blob/b50844c6925d6780d110bbddb3c47d0797f57c7a/contracts/examples/Mars.sol#L172) contract. 

```solidity
/**
     * @dev Sends a packet with a greeting message over a specified channel, and deposits a fee for relaying the packet
     * @param message The greeting message to be sent.
     * @param channelId The ID of the channel to send the packet to.
     * @param timeoutTimestamp The timestamp at which the packet will expire if not received.
     * @notice If you are relaying your own packets, you should not call this method, and instead call greet.
     * @param gasLimits An array containing two gas limit values:
     *                  - gasLimits[0] for `recvPacket` fees
     *                  - gasLimits[1] for `ackPacket` fees.
     * @param gasPrices An array containing two gas price values:
     *                  - gasPrices[0] for `recvPacket` fees, for the dest chain
     *                  - gasPrices[1] for `ackPacket` fees, for the src chain
     * @notice The total fees sent in the msg.value should be equal to the total gasLimits[0] * gasPrices[0] +
     * @notice Use the Polymer fee estimation api to get the required fees to ensure that enough fees are sent.
     * gasLimits[1] * gasPrices[1]. The transaction will revert if a higher or lower value is sent
     */
    function greetWithFee(
        string calldata message,
        bytes32 channelId,
        uint64 timeoutTimestamp,
        uint256[2] memory gasLimits,
        uint256[2] memory gasPrices
    ) external payable returns (uint64 sequence) {
        sequence = dispatcher.sendPacket(channelId, bytes(message), timeoutTimestamp);
        _depositSendPacketFee(dispatcher, channelId, sequence, gasLimits, gasPrices);
    }
```

The `depositSendPacketFee` function will deposit the relayer fees for your application's receiving transaction and associated execution to the Polymer relayer. (More about this in the **Fee Section**.)

## Executing Packet on Receiving chain

Your smart contract on the chain you are communicating with will need to implement the **IBC Receiver Interface** in your dApp. This is required so our **dispatcher smart** contract on the destination chaincan call these methods on your dapp.

```solidity
/**
 * @title IbcPacketReceiver
 * @notice Packet handler interface must be implemented by a IBC-enabled contract.
 * @dev Packet handling callback methods are invoked by the IBC dispatcher.
 */
interface IbcPacketReceiver {
    /**
     * @notice Callback for receiving a packet; triggered when a counterparty sends an an IBC packet
     * @param packet The IBC packet received
     * @return ackPacket The acknowledgement packet generated in response
     * @return skipAck Whether to skip sending an acknowledgement packet
     * @dev Make sure to validate packet's source and destiation channels and ports.
     */
    function onRecvPacket(IbcPacket calldata packet) external returns (AckPacket memory ackPacket, bool skipAck);

    /**
     * @notice Callback for acknowledging a packet; triggered on reciept of an IBC packet by the counterparty
     * @param packet The IBC packet for which acknowledgement is received
     * @param ack The acknowledgement packet received
     * @dev Make sure to validate packet's source and destiation channels and ports.
     */
    function onAcknowledgementPacket(IbcPacket calldata packet, AckPacket calldata ack) external;

    /**
     * @notice Callback for handling a packet timeout
     * @notice Direct timeouts are currently unimplemented, so this callback is currently unused. Packets can still be
     * indirectly timedout in the recieve callback.
     * @param packet The IBC packet that has timed out
     * @dev Make sure to validate packet's source and destiation channels and ports.
     */
    function onTimeoutPacket(IbcPacket calldata packet) external;
}
```

Defining your own callback or the receiving function:

```solidity
/**
     * @notice Callback for receiving a packet; triggered when a counterparty sends an an IBC packet
     * @param packet The IBC packet received
     * @return ackPacket The acknowledgement packet generated in response
     * @return skipAck Whether to skip the writeAck event.
     * @dev Make sure to validate packet's source and destiation channels and ports.
     */
     
     function onRecvPacket(IbcPacket memory packet)
        external
        virtual
        onlyIbcDispatcher
        returns (AckPacket memory ackPacket, bool skipAck)
    {
        recvedPackets.push(packet);

        // here you'll typically decode the packet.data and do something with it

        return (AckPacket(true, abi.encodePacked('ack_payload'), false);
    }
```

In the above:

- The dispatcher on the source chain uses the returned `AckPacket` to emit a `WriteAckPacket` event.
- If you wish to avoid any acknowledgments, simply have your dapp return a  `skipAck` value of  false in the `onRecvPacket` callback.

**Example:** An application (e.g., [Mars demo contracts](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/examples/Mars.sol)) that simply responds to a received message with "got the message".

```solidity
 		function onRecvPacket(IbcPacket memory packet)
        external
        virtual
        onlyIbcDispatcher
        returns (AckPacket memory ackPacket, bool skipAck)
    {
        recvedPackets.push(packet);

        // solhint-disable-next-line quotes
        return (AckPacket(true, abi.encodePacked('{ "account": "account", "reply": "got the message" }')), false);
    }
```

**Note:** The `onlyIbcDispatcher` modifier ensures that only the dispatcher contract can call the functions. Functions which don't have this modifier allow any arbitrary (read: potentially malicious) dapp to call them, which can result in unintended consequences.  

Inheriting from the [`IbcReceiverBase` contract](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/interfaces/IbcReceiver.sol#L77-L103) enables you register the dispatcher and implement the required interfaces, but do note that you still have to use this `onlyIbcDisaptcher` modifier on all methods which are polymer related.

```solidity
contract IbcReceiverBase is Ownable {
    IbcDispatcher public dispatcher;

    error notIbcDispatcher();
    error UnsupportedVersion();
    error ChannelNotFound();

    /**
     * @dev Modifier to restrict access to only the IBC dispatcher.
     * Only the address with the IBC_ROLE can execute the function.
     * Should add this modifier to all IBC-related callback functions.
     */
    modifier onlyIbcDispatcher() {
        if (msg.sender != address(dispatcher)) {
            revert notIbcDispatcher();
        }
        _;
    }

    /**
     * @dev Constructor function that takes an IbcDispatcher address and grants the IBC_ROLE to the Polymer IBC
     * Dispatcher.
     * @param _dispatcher The address of the IbcDispatcher contract.
     */
    constructor(IbcDispatcher _dispatcher) Ownable() {
        dispatcher = _dispatcher;
    }

    /// This function is called for plain Ether transfers, i.e. for every call with empty calldata.
    // An empty function body is sufficient to receive packet fee refunds.
    receive() external payable {}
}
```

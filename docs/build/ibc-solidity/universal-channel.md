---
sidebar_position: 3
sidebar_label: 'Universal channels'
---
# Universal Channel Middleware

In the last [section on building IBC apps in Solidity](ibc-solidity.md) we (implicitly) looked at how to build IBC enabled applications in Solidity by implementing the ICS-26 interface from the IBC spec, setting up packet lifecycle and channel lifecycle callbacks.

However, as mentioned in the [app developer workflow overview](../dev-workflow/app-dev.md), there's also the possibility to send packets over a universal channel, eliminating the need to go through a channel handshake for every new pair of contracts that you want to send IBC packets between.

## Overview

The Universal channel is implemented as an IBC application, implementing the ICS-26 interface as any IBC application would. However, for applications to build on top of the universal channel, the handler contract is implemented as a middleware that applications include in their middleware stack.

:::info Middleware in IBC

[IBC Middleware](https://github.com/cosmos/ibc/tree/main/spec/app/ics-030-middleware) (MW) is an integral part of the IBC protocol. IBC Middleware will enable arbitrary extensions to an application's functionality without requiring changes to the application or core IBC. It is useful for logic that is shared among many applications but not so universal to be enshrined in the core protocol.

:::

## Universal Channel

The Universal Channel (UC) is designed to simplify the process of sending and receiving IBC packets for dApp users. Without the UC, dApp users would need to perform a channel handshake every time they want to establish a new IBC connection between pairs of contracts. This can be a complex and error-prone process, especially for users who are not familiar with the intricacies of the IBC protocol.

The UC abstracts away these complexities by providing a single, universal channel between *two chains* (so building on top of an IBC connection) that all dApps can use to send and receive IBC packets to and from. The UC handles the channel handshake and IBC core authentication, so dApp users do not need to worry about it. See caveat below.

:::tip Universal channel as onboarding

Making use of a universal channel can be an excellent way to onboard onto IBC for new developers. It allows developers to get familiar with the packet lifecycle without dealing with the complexities of the channel lifecycle.

:::

You can see the implementation of the Universal Channel in the [UniversalChannelHandler.sol](https://github.com/open-ibc/vibc-core-smart-contracts/tree/main/contracts/core/UniversalChannelHandler.sol) contract.

### IBC packets vs. Universal Packets

For regular IBC packets, both packet sender and receiver with unique IBC ports are the exclusive owners of the channel, with two channel ends on each chain, respectively.

For Universal Packets, packet sender and receiver still have unique IBC ports for packet routing, but they do not own the channel. Instead, the Universal Channel Middleware contract owns the channel, and it is responsible for handling the channel handshake and authentication.
One sender can send universal packets over the same universal channel to multiple receivers, and one receiver contract can receive universal packets from multiple senders over the same universal channel too. 

- On the sender side, a universal packet is packed into a regular IBC packet and sent over the universal channel.

- On the receiver side, the Universal Channel Middleware contract processes the standard IBC packet to extract the universal packet. It then forwards this universal packet through any other Middleware in the stack, as needed, until it arrives at the final destination specified in the `UniversalPacket.destPortAddress` field.

:::caution Additional authentication

When using the universal channel, many applications share the channel. It is therefore recommended to enact some additional authentication when receiving universal packets from the UC handler.

:::

### How Universal Channel Middleware Works

The Universal Channel Middleware works by packing and unpacking a UniversalPacket into a regular IBC packet's data field. This allows the Middleware to handle the contents of the packet in a generic way, without needing to know the specifics of the packet's format.

The Universal Channel Middleware is defined in the [UniversalChannelHandler.sol](https://github.com/open-ibc/vibc-core-smart-contracts/tree/main/contracts/core/UniversalChannelHandler.sol) contract, and it implements the `IbcUniversalChannelMW` interface defined in [IbcMiddleware.sol](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/interfaces/IbcMiddleware.sol#L117). Along with the `IbcPacketReceiver` and `IbcChannelReceiver` which enable it to act as IBC application.

### Using Universal Channel to Send and Receive Packets 

As a dApp user, you can use either UC or another MW stack on top of UC to send and receive IBC packets. The UniversalChannelHandler MUST always be directly wrapping the dispatcher.

### Sending Universal Packets

To send a packet, you need to call the sendUniversalPacket function of the UC. This function takes four arguments:

- `channelId`: The ID of the channel you want to send the packet over.
- `destPortAddr`: The address of the destination port.
- `appData`: The data payload specific to your dApps.
- `timeoutTimestamp`: The timestamp in nanoseconds at which the packet should timeout on destination chain.

Here's a simplified example of how to send a packet:
```solidity
// first, get the Universal Channel Handler contract instance
IbcUniversalPacketSender uc = IbcUniversalPacketSender(0x1234567890...);
// get `channelId` from Polymer registry that represents a unidirectional path from the running chain to a destination chain, from the running's perspective
uc.sendUniversalPacket(channelId, destPortAddr, appData, timeoutTimestamp);
```

### Receiving Packets, Acks, and Timeouts

To be able to receive a packet, you need to implement the [`IbcUniversalPacketReceiver`](https://github.com/open-ibc/vibc-core-smart-contracts/tree/main/contracts/interfaces/IbcMiddleware.sol#L76) interface in your contract. This function is called by the UC when a packet is received.

Here's a simplified example of how to receive a packet:
```solidity
// Implement the IbcUniversalPacketReceiver interface in your contract
contract MyContract is IbcUniversalPacketReceiver {
    function onRecvUniversalPacket(bytes32 channelId, UniversalPacket calldata ucPacket)
        external
        onlyIbcMw
        override
    {
        // use channelId to identify which chain the packet came from
        // Handle the received packet
        ...
    }
    // similar callbacks for acks and timeouts
}
```

You can also check out the [Earth contract](https://github.com/open-ibc/vibc-core-smart-contracts/tree/main/contracts/examples/Earth.sol) for a more complete example of how to use the Universal Channel or a MW stack to send and receive packets.

## Creating a Middleware Stack

A Middleware stack is a sequence of Middleware contracts that a packet passes through in order. Each Middleware in the stack can inspect and potentially modify the packet before passing it on to the next Middleware.

To create a Middleware stack, you need to register the Middleware contracts with the Universal Channel Middleware. This is done using the [registerMwStack function](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/core/UniversalChannelHandler.sol#L141) in the UniversalChannelHandler contract. The Middleware contracts are identified by a bitmap and an array of addresses.

Check out tests in [Universal channel and MW tests](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/test/universal.channel.t.sol) for full examples of how to register a Middleware stack.

:::tip IBC app Solidity template

The easiest way to leverage Universal Channels as a dApp developer is to use [ibc-app-solidity-template repo](https://github.com/open-ibc/ibc-app-solidity-template) and its [UniversalChanIbcApp.sol](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/contracts/base/UniversalChanIbcApp.sol) base contract. Simply inherit the contract and override the packet lifecylce callbacks (universal version) and add your custom logic.

Registration of the middleware stack (if it's only the application contract on top of the UC) is taken care of by the base contract.

:::

## Limitation and Future Work

Currently, the Universal Channel Middleware requires the Middleware contracts to be registered with their MW stack contracts' addresses. 

In the future, Polymer will provide a global registry of Middleware stacks, which maps MW stack ID to a list of MW contract addresses on Polymer chain. 

:::caution Good-to-know

When using the Universal Channel and Middleware, it's important to be aware of the following points:

- The Middleware contracts MUST be trusted, otherwise they should never be used. They have the ability to inspect and modify the packets, so they should be carefully audited to ensure they do not introduce any security vulnerabilities.
- The order of Middleware contracts in the stack matters. Each Middleware contract passes the packet to the next Middleware in the stack, so the order in which they are registered will determine the order in which they process the packet.

:::

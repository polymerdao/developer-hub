---
sidebar_position: 1
sidebar_label: 'Intro to IBC'
---

# IBC essentials

In February 2021, the Cosmos Stargate release brought the Inter-Blockchain Communication (IBC) protocol into the world. It includes a set of upgrades that implemented the first step towards realizing the original vision laid out in the Cosmos whitepaper — to build a network of sovereign, interoperable blockchains.

:::info

IBC is a **general-purpose, message-passing solution that allows blockchains to communicate in a trust-minimized, and permissionless way**. The IBC community, Polymer included, envisions a world where IBC acts as the connective tissue for the _Internet of blockchains_.

:::

The aim here is not to give an in-depth dissertation on IBC. There are already a number of resources starting that work. Be sure to check out these resources if you haven't already:

- The [IBC protocol website](https://ibcprotocol.dev)
- The [IBC specification](https://github.com/cosmos/ibc/)
- The [ibc-go documentation](https://ibc.cosmos.network/): ibc-go is the IBC implementation of the core IBC protocol for Cosmos SDK chains and is currently the most advanced IBC implementation. It is also the IBC implementation run on Polymer.

The section here will give a quick high-level overview that will discuss the most important abstractions from the IBC protocol, especially those concerning application developers (e.g. those writing IBC enabled smart contracts).

## IBC, and its formal specification

IBC is the first open and permissionless interoperability protocol to launch that allows for open participation. It is a [complete interoperability model](../../background/interop.md/#the-interoperability-model) consisting of an application, transport and state layer with a clean separation between each layer.

There's a complete [IBC specification](https://github.com/cosmos/ibc/) that allows for open source improvements and for teams to implmenent the protocol in existing or new blockchain architectures.

![IBC overview](../../../static/img/ibc/IBC1.png)

:::note

The IBC specification, also called the Interchain Standards, define a set of subprotocols that together form the IBC protocol. They can be divided into application, transport and state layer standards and have the following format: ICS-n.

:::

A full exploration of the IBC specification is out of scope, but we'll review the most important abstractions the protocol provides: the ICS-2 spec for clients, ICS-3 for connections and ICS-4 for channels.

## IBC clients (ICS-2)

IBC light clients are the bottom layer of the IBC abstractions. They concern the state layer of the IBC protocol. As for the purposes of application developers, the clients are not central to their daily development life (that is, provided they are available and a connection and channel have been built on top for them to interact with).

Hence we encourage the reader to investigate for themselves how clients work in the [02-client specification](https://github.com/cosmos/ibc/blob/main/spec/core/ics-002-client-semantics/README.md) [the light client development guide](https://tutorials.cosmos.network/academy/3-ibc/5-light-client-dev.html).

There's three major interfaces of importance to clients:

- ConsensusState: represents the state of the connected blockchain at a specific chain height. IBC transport expects only a single ConsensusState per height
- ClientState: represents the full state of the connected blockchain, including ConsensusState, some client parameters and proof specs
- ClientMessage: represents the messages that will be submitted to interact with the client

Through ClientMessages submitted by the relayer, one can interact with the relayer. Headers or batches of headers can be submitted to update the ConsensusState, or a proof of misbehaviour (defined particular to its consensus rules) can be submitted to freeze the client. Additonally there are methods to update the client when the remote chain it represents has ugpraded.

One more way of interacting with the client is when it `VerifyMembership` or `VerifyNonMembership` methods are called during the [packet lifecycle](#ibc-application-packet-flow) to verify if some state was committed or absent respectively.

![Client interactions](../../../static/img/ibc/IBC2.png)

:::tip How to think about clients

A short and succinct summary of a light client's functionality is the following: a **light client stores a trusted view of the remote chain or "consensus state", and provides functionality to verify updates to the consensus state or verify packet commitments against the trusted root.**

:::

We look at IBC clients and how they are more flexible than many realize in [the dedicated section](./ibc-clients.md).

:::info Standard key/value format for state layer data

```typescript
/{clientID}/clientState: ClientState
/{clientID}/consensusStates/{height}: ConsensusState(height)
```
:::

## Connections (ICS-3)

Once mutual knowledge of state, i.e. clients on both chains, has been established, a connection between the two chains must be formally negotiated. Connection handshakes are bidirectional and require a multi step confirmation process between the two chains where they can share information with one another. An established connection encodes information on versioning, underlying client identifier and various security parameters like delayPeriod used as a misbehavior submission window.

:::tip How to think about connections

If you want to connect two blockchains with IBC, you will need to establish an IBC **connection**. Connections, established by a four-way handshake, are responsible for:

1. Establishing the identity of the counterparty chain.
2. Preventing a malicious entity from forging incorrect information by pretending to be the counterparty chain. IBC connections are established by on-chain ledger code and therefore do not require interaction with off-chain (trusted) third-party processes.

:::

The four handshake steps are (triggered by chain A, to connect to chain B):

1. `ConnOpenInit` Hello chain B, here is information that you can use to
   verify I am chain A. Do you have information I can use?
2. `ConnOpenTry` Hello chain A, I have verified that you are who you say
   you are. Here is my verification information.
3. `ConnOpenAck` Hello chain B. Thank you for that information I have
   verified you are who you say you are. I am now ready to talk.
4. `ConnOpenConfirm` Hello chain A. I am also now ready to talk.

:::info

The connection handshake, next to establishing the communication channels between chains (to be precise, IBC clients💡), also provide _double identify verfication_ on the handshake!

:::


The connection semantics are described in more detail in [the ICS-3 spec](https://github.com/cosmos/ibc/tree/master/spec/core/ics-003-connection-semantics).

### What does a connection look like?

A connection is an abstract concept, and to be more precise encapsulates two `ConnectionEnd` objects on the chains on either side.

```typescript
interface ConnectionEnd {
  state: ConnectionState
  counterpartyConnectionIdentifier: Identifier
  counterpartyPrefix: CommitmentPrefix
  clientIdentifier: Identifier
  counterpartyClientIdentifier: Identifier
  version: string | []string
  delayPeriodTime: uint64
  delayPeriodBlocks: uint64
}

// with...
enum ConnectionState {
  INIT,
  TRYOPEN,
  OPEN,
}
```

Note that the client identifier will identify 'instances' of some client type (with the same consensus), e.g. `07-tendermint-123` for Cosmos SDK chains.


:::info Standard key/value for connection data
```typescript
/connections/{connectionID} : ConnectionEnd
```

:::

## Channels (ICS-4)

When a connection is established between two chains (clients💡), another four step handshake can be triggered, this time to create a channel on top of the connections.

Channels are virtual communication pathways that facilitate the transfer of packets between specific modules on different chains. They allow the secure and reliable exchange of assets, data, or messages. Channels provide ordering and sequencing guarantees to ensure the correct and consistent delivery of packets.

1. `ChanOpenInit`: will set the chain A into `INIT` state. This will call `OnChanOpenInit` so application A can apply the custom callback that it has set on `INIT`, e.g. check if the port has been set correctly, the channel is indeed unordered/ordered as expected, etc. An application version is also proposed in this step.
2. `ChanOpenTry`: will set chain B into `TRY` state. It will call `OnChanOpenTry` so application B can apply its custom `TRY` callback. Application version negotiation also happens during this step.
3. `ChanOpenAck`: will set the chain A into `OPEN` state. This will call `OnChanOpenAck` which will be implemented by the application. Application version negotiation is finalised during this step.
4. `ChanOpenConfirm`: will set chain B into `OPEN` state so application B can apply its `CONFIRM` logic.

### What does a channel look like?

A channel is an abstract concept, and to be more precise encapsulates two `ChannelEnd` objects on the chains on either side.

```typescript
interface ChannelEnd {
  state: ChannelState
  ordering: ChannelOrder
  counterpartyPortIdentifier: Identifier
  counterpartyChannelIdentifier: Identifier
  connectionHops: [Identifier]
  version: string
}

// with...
enum ChannelState {
  INIT,
  TRYOPEN,
  OPEN,
  CLOSED
}

// and...
enum ChannelOrder {
  ORDERED,
  UNORDERED,
  ORDERED_ALLOW_TIMEOUT // yet to be implemented in ibc-go
}
```

There are currently two different types of channels in terms of ordering, implemented in ibc-go:

- An **ordered channel** is _a channel where packets are delivered exactly in the order in which they were sent_. Modeled after TCP.
- An **unordered channel** is _a channel where packets can be delivered in any order_, which may differ from the order in which they were sent. Modeled after UDP.

:::info Standar key/value format for channel and packet data
```typescript
/channelEnds/ports/{portID}/channels/{channelID}: channel info
/nextSequenceSend/ports/{portID}/channels/{channelID}: next sequence number for sending
/nextSequenceRecv/ports/{portID}/channels/{channelID}: next sequence number for receiving
/nextSequenceAck/ports/{portID}/channels/{channelID}: next sequence number for acking
/acks/ports/{portID}/channels/{channelID}/sequences/{sequence}: packet acknowledgment
/commitments/ports/{portID}/channels/{channelID}/sequences/{sequence}: packet commitment
/receipts/ports/{portID}/channels/{channelID}/sequences/{sequence}: packet receipt
```

:::

### What about ports (ICS-5)?

Channels are tightly coupled to the concept of ports. A [port](https://github.com/cosmos/ibc/blob/main/spec/core/ics-005-port-allocation/README.md) serves as a standardized entry point for a specific module on a blockchain to bind to, allowing the module to send and receive packets through the IBC channels.

Here are key points to remember about ports:

- **Definition**: A port defines a unique identifier associated with a module on a blockchain network. It represents the interface through which the module can send and receive IBC packets.

- **Module Interaction**: Each port is associated with a specific module on a blockchain. The module can define the necessary logic and functionality to handle the packets sent and received through the port.

- **Port Capability**: A port can have associated **capabilities** that specify the supported features and operations of the module. These capabilities are exchanged and verified during the channel handshake process to ensure compatibility between interconnected chains.

- **Packet Routing**: Ports play a crucial role in routing packets between blockchains. When a packet is sent through a channel, it is routed to the appropriate port on the receiving chain based on the channel's associated module and port identifier.

- **Security and Authentication**: Ports are designed to enforce security and authentication measures. They ensure that only authorized modules can send and receive packets through the associated port, preventing unauthorized access and tampering.

By using ports, IBC enables different modules on separate blockchains to establish communication channels and exchange packets securely and reliably.

**Desired Properties**:

- Once a module has bound to a port, no other modules can use that port until the module releases it
- A module can, on its option, release a port or transfer it to another module
- A single module can bind to multiple ports at once
- Ports are allocated first-come first-serve, and "reserved" ports for known modules can be bound when the chain is first started

:::info 1-> many connection-> channel

A connection may have any number of associated channels which is analogous to being able to establish multiple TCP connections over a single physical connection. However, each channel is associated with only one connection ID, which indicates which light client it is secured by, and one port ID which indicates the application that it is connected to.

:::

## IBC Application Packet flow

When the clients, connection and channel has been established, packets can be sent across the channel. This is where the IBC application developer's work comes into play.

:::tip One-time handshake, off you go!

The above client, connection and channel establishment need to happen only once to get the channel set up. Once this is the case the packet flow, as will be described below, is what will be repeated multiple times over for each packet.

:::

### What does a packet look like?

Packets carry opaque data or bytes to be delivered over a channel. Packets may be timed out after some period of time if the packet does not reach the destination chain. Also, only the packet commitment is written to state instead of the packet data itself.

Packets form the backbone of all message passing in IBC. Let's have a look at the packet interface definition:

```typescript
interface Packet {
  sequence: uint64
  timeoutHeight: Height
  timeoutTimestamp: uint64
  sourcePort: Identifier
  sourceChannel: Identifier
  destPort: Identifier
  destChannel: Identifier
  data: bytes
}
```

`Sequence` denotes the sequence number of the packet in the channel.

`TimeoutTimestamp` and `TimeoutHeight` (pick one of these) dictate the time before which the receiving module must process a packet.

The `data` field is where the actual application data will be sent after being encoded to bytes.

:::note

Note that the encoding scheme is agreed upon in the channel version negotiation during the channel handshake!

:::

Sometimes you'll see the channel ID and port combined into:

```typescript
interface IbcEndpoint {
  port_id: Identifier
  channel_id: Identifier
}
```

This satisfies the specification as well, don't be confused when you see it pop up.

### Packet relay steps

The packet flow for IBC applications is covered in detail [here](https://tutorials.cosmos.network/academy/3-ibc/3-channels.html#application-packet-flow). You are encouraged to go through it, both the _happy path_ or the case in which a timeout has taken place.

Consider the diagram below and see the different messages involved in the packet flow:

1. `SendPacket`: triggered by a user (could be another module) and has the application (developer) encode a packet to be sent.
2. `RecvPacket`: a relayer will submit a message on the destination with the packet as well as a proof of commimtment (at certain height) on the source.
3. `AcknowledgePacket`: a relayer will submit an acknowlegment back on the source with either a success ack or error ack depending on whether the `RecvPacket` succeeded or errored.
4. `Timeout`: after the timeout period has passed, a relayer will submit a proof of non-receipt (enabled by how the IBC data is stored at specific keys) along with the packet to revert application logic that may have anticipated successful receipt.

![packet flow](../../../static/img/ibc/IBC3.png)

Does the diagram start to make sense? One element we have not yet discussed, the packet callbacks.

## The IBC application module callbacks

The [ICS-26](https://github.com/cosmos/ibc/blob/main/spec/core/ics-026-routing-module/README.md) specification describes an IBC routing handler.

The routing module is a default implementation of a secondary module which will accept external datagrams and call into the interblockchain communication protocol handler to deal with handshakes and packet relay. The routing module keeps a lookup table of modules, which it can use to look up and call a module when a packet is received, so that external relayers need only ever relay packets to the routing module.

An example of a datagram that the IBC routing module will receive upon the attempt to "receive an IBC packet" from a source chain, looks like this:

```typescript
interface RecvPacket {
  packet: Packet
  proof: CommitmentProof
  proofHeight: Height
}
```

IBC application modules (could be smart contracts on smart contracting platforms) are required to have callbacks defined to define application level logic corresponding to the steps in both the channel lifecycle and packet relay.

They are the following callbacks:

```typescript
interface ModuleCallbacks {
  onChanOpenInit: onChanOpenInit
  onChanOpenTry: onChanOpenTry
  onChanOpenAck: onChanOpenAck
  onChanOpenConfirm: onChanOpenConfirm
  onChanCloseConfirm: onChanCloseConfirm
  onRecvPacket: onRecvPacket
  onTimeoutPacket: onTimeoutPacket
  onAcknowledgePacket: onAcknowledgePacket
  onTimeoutPacketClose: onTimeoutPacketClose //for ordered channels
}
```

A more detailed description on how to implement that in a Solidity smart contract, can be found in [the section on IBC apps in Solidity](../../build-dapps/ibc-solidity/ibc-solidity.md).

## Putting it all together

The client, connection and channel (and port) abstractions are the major "core IBC" abstractions defined by the protocol. Together they form the transport layer (and part of the state layer, with the client instances). How to implement the protocol in the blockchain code is left to the core developer. But there are some extra useful handlers that facilitate the communication flow.

The application layer of IBC is separated from the transport layer of IBC by the [ICS-25 IBC handler interface](https://github.com/cosmos/ibc/blob/main/spec/core/ics-025-handler-interface/README.md). The general interface includes all of the functionality for IBC client, connection and channel lifecycle management as well as packet relay. We’ll discuss each of these transport layer components in more detail below. An IBC application implements a subset of these handler methods defined by the [ICS-26 routing module](https://github.com/cosmos/ibc/blob/main/spec/core/ics-026-routing-module/README.md). This allows IBC applications to hook into all aspects of the IBC transport lifecycle. Think of IBC application standards as defining standards like HTTP and gRPC on top of TCP. 

The configuration of ibc-go, the IBC implementation native to Cosmos SDK chains, generally looks as follows.

![Chain with native IBC implementation](../../../static/img/ibc/ibc-native.png)

ICS-2, ICS-3, ICS-4 and ICS-5 are implemented in the "core IBC" SDK module, as are ICS-25 and ICS-26. The IBC application modules are defined as separate modules that communicate with the transport layer through the IBC handler and router interfaces. 
:::tip

The above diagram will be an important flow to remember when considering how [virtual IBC](../vibc/overview.md) manages to outsource the transport layer of IBC to an interoperability hub like Polymer.

:::
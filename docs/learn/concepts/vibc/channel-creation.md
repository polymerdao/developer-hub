---
sidebar_position: 4
sidebar_label : 'Onto channel creation'
---

# Creating IBC abstractions: clients, connections and channels

<!-- TODO: add diagrams -->

Now that you're familiar with all of the vIBC components, let's take a look at the steps that are needed to start sending packets between chains.

As is the case with [regular IBC](../ibc/ibc.md), to send packets we first need to ensure that clients, connection and a channel have been created.

:::tip Relayer involvement

Remember that in order to create connections and channels, a handshake is protocol followed with steps on either ends of the connecting chains. In the case of virtual IBC with Polymer acting as interoperability hub, 3 chains (at least) will be involved in the creation of a multi-hop channel.

To manage the flow of information between the different components on different chains, relayers (both the regular and vIBC kind) will be heavily involved in the process. Remember that these are generally third-party off-chain agents, but _self relaying_ is also possible.

:::

## Client creation

As far as client creation is concerned, we can distinguish between native IBC chains and virtual IBC chains that outsource the IBC workload to Polymer. For the former, the regular IBC client messages for client creation apply.

:::info Polymer client for IBC enabled chains

IBC enabled chains (e.g. Cosmos SDK chains) that want to connect to virtual chains through Polymer need to run an IBC client to track Polymer consensus. This means they need to run an Ethereum client.

Alternatively, they could connect through an extra hop using an IBC hub for which this chain has a client type on the condition that the IBC hub does run a Polymer client. A 3-hop multi-hop channel could then be established.

:::

For a virtual chain, client creation involves creating **both a native and a virtual light client** on Polymer. When the chain has single slot finality, both the native and the virtual light clients are one and the same. However, when the chain does not have single slot finality, a native light client is created that captures all of the active forks of the chain. **Multiple virtual light clients are allowed** to be created as each implements a fork choice rule on top of the native light client’s view.

## Connection creation

When the clients have been created, next up are the connections. Now, when a virtual chain outsources its IBC workload to Polymer, it is Polymer that will run a client on behalf of the virtual chain. A connection "between Polymer and the virtual chain" will thus be a **local connection on Polymer**, we call this a localhost connection.

:::info ICS-9: loopback client

The IBC specification includes a [spec for a loopback client](https://github.com/cosmos/ibc/tree/main/spec/client/ics-009-loopback-cilent). This is a light client that is used for a localhost IBC connection which represents an _IBC connection from a chain to itself_. This client has read only access to the local state store.

:::

Using the loopback client interface to represent Polymer's state, we can create a so-called **virtual connection** (an instance of a localhost connection) that uses the loopback client as one of its `ConnectionEnd`s and the virtual client (storing the virtual chains virtual root, or ConsensusState) as the other. Virtual IBC connections allow connected chains to be aware of the state of the virtual chain separately from the state of Polymer.

:::tip No handshakes here

Because a virtual connection is local on Polymer, there is no need for a handshake protocol. This is according to the loopback client spec for a localhost connection.

:::

:::caution Localhost connection

The canonical localhost implementation used in [ibc-go](https://github.com/cosmos/ibc-go/tree/main/modules/light-clients/09-localhost), uses only one _sentinel localhost connection_ that has only one `ConnectionEnd` characterized by the loopback client.

This varies in our implementation of a virtual connection. Another difference is that there can only be 1 sentinel localhost connection, yet multiple virtual IBC connections: 1 for every virtual client associated with a virtual chain.

:::

## Multi-hop channel creation

The client and connection for virtual chains is where the innovation sets in. Once virtual connections have been created between Polymer and the virtual chains, the channel creation is default multi-hop channel creation. A multi-hop IBC channel can be established over multiple connections virtual and non-virtual. Specific details around the general multi-hop IBC protocol are covered in [the dedicated section](../ibc/multi-hop.md). 

Channel handshake messages originate as IBC events on the virtual chain, refer to the [vIBC specification](https://github.com/polymerdao/polymerase/blob/main/chain/docs/vibc/vibc-api-spec.md). We'll not cover the channel lifecycle in detail here, but next up is the packet lifecycle deep dive which is analogous.

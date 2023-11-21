---
sidebar_position: 3
sidebar_label: 'Intro to Polymer'
---

# Introducing Polymer

:::danger Placeholder

Still need to iterate on this. Bo delivered this initial draft.

:::

The interoperability story for rollups on Ethereum today is both highly fragmented and insecure. The primary goal for Polymer is to bring the interoperability story of the Cosmos or IBC to Ethereum and its rollups. Our approach to doing so is to put the Cosmos SDK on top of the OP stack and build Ethereum’s first interoperability hub. A secondary goal is to enable builders to build a network of natively interoperable rollups. 

![Ethereum's IBC interoperability Hub](../../static/img/background/ethereum-ibc.png)

## IBC as the Interoperability Standard

IBC is best positioned to become the interoperability standard for Ethereum and web3 broadly. It’s an open and neutral standard with no single entity controlling the direction of the technology. It’s the product of a collaboration across a number of teams and exists as both a formal specification and a number of implementations across a growing number of ecosystems.

## Zero Value Capture & Open Competition

IBC has no value capture at the protocol level. It also enables open competition in terms of connectivity. An IBC channel can be formed over any list of IBC connections. A connection is unable to create a vendor lock in for bridged tokens over the ICS20 standard. This means that the channel can be updated to use another connection either switching between using another middle hop/router or to connect directly with its destination. 


## Evolution of Network Topologies

There are different high level approaches to interoperability when it comes to network topology. Peer to peer or p2p approaches were some of the earliest approaches that were explored. P2P connectivity scales poorly with the number of connected chains as you have an N^2 connectivity problem. Hub and spoke approaches came next and improved on the scalability at the cost of introducing a middleman between connected chains. An IBC enabled hub like Polymer further improves on scalability by allowing for a mesh network topology where any chain in the IBC network can directly connect to any other chain no matter how distant. 


## Polymer as a Port City

Ethereum itself has opted for protocol minimalism at the L1 level. This is a similar approach to the cosmos hub where functionality is implemented by chains that are secured by the L1. For example, Ethereum is leaning on L2s for scalability and sharding whereas the Cosmos Hub is leaning on ICS chains for a smart contract chain and liquid staking etc. 

Polymer is being built as an L2 making it Ethereum’s first interoperability hub. In a sense, Polymer enshrines IBC interoperability into the Ethereum ecosystem. Polymer provides native IBC interoperability with Ethereum security. Polymer acts a port city connecting rollups on Ethereum with the growing IBC network effectively making the Ethereum ecosystem a part of the interchain.

## Cost of Connectivity

This approach lowers the cost of connectivity. The cost of connectivity is the sum of the cost of client updates, packets, infrastructure and security. Existing interoperability hubs are built as sovereign chains or guardian sets. The cost of infrastructure for these protocols scales with the number of connected chains and validators. These protocols also generally utilize the protocol token for security which results in either low security or a high security budget if they decide to utilize security solutions such as ICS or restaking. Polymer as an L2 merges infrastructure and security costs into the cost of settlement. This allows Polymer to provide lower cost of connectivity with comparable security.

## Transparent Upgrades
Polymer’s architecture allows it to IBC enable connected chains and make them visible to the IBC network without the chains needing to implement IBC themselves. However, chains connected via Polymer are not locked into using Polymer. If the chain ends up implementing IBC natively, a channel upgrade can be performed to update the underlying list of connections from using Polymer to another hub or direct connection.

## A Network of Interoperable Rollups

The secondary goal will play a big part in growing the interchain. Putting the Cosmos SDK on top of the OP stack combines best in class developer experience when it comes to building app chains with powerful settlement functionality. The developer experience when it comes to building app rollups with the existing OP stack is not quite there yet. It’s currently quite challenging to add a new execution engine (EE) in addition to making an EE highly customizable for app developers. The Cosmos SDK fixes this developer UX problem while usage of the OP stack fixes the distribution problem for Cosmos tech.

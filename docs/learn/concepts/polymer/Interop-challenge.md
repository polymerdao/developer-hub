---

sidebar_position: 3
sidebar_label: 'Interoperability Challenge'

---

# Interoperability: Why Do We Need It?

The blockchain space is evolving towards an ever-growing number of execution shards. L1s, alt-L1s, rollups, app chains, and app rollups all fall under this category. Modular blockchains further complicate the landscape by significantly expanding the design space for blockchains.

These advancements improve the overall throughput of web3 as a whole but **increase fragmentation**. What is gained in scalability is often lost due to a lack of interoperability.

:::tip Need for Interoperability Standards

The increasing fragmentation resulting from approaches to tackle scalability clearly motivates the need for industry-wide interoperability standards, as well as a secure and trust-minimized communication layer.

:::

The glaring need for interoperability has incentivized fierce competition among both novel and existing interoperability protocols.

## The Interoperability Model

To address the interoperability challenge, numerous projects have attempted various approaches, ranging from highly centralized solutions using a permissioned relayer and oracle pair, to computing zero-knowledge consensus proofs. Many of these approaches focus on _how to move state from one blockchain to another_ which, while indeed critical, is only part of the interoperability problem. The state component addresses just a single layer of the interoperability model.

### A Layered Interoperability Model

A **complete interoperability model consists of three layers, each with a clear separation**.

The layers in this model mirror those from the Open Systems Interconnection model (OSI model) used in network communication.

![OSI Model Comparison of Interoperability Model](../../../static/img/background/OSI-comp.png)

:::note Interchain Standards

Below, we'll refer to the _**I**nter**c**hain **S**tandards_, or ICS-x for short. These refer to the [official IBC protocol specification](https://github.com/cosmos/ibc).

:::

1. **The Application Layer** represents the application logic responsible for encoding/decoding and interpretation of the data to be sent, interacting with a common transport layer it sits atop of. The transport layer then handles packets of opaque byte data without having any concern what application logic it represents. This layer in interoperability often shares the execution environment with regular applications (e.g., EVM). There are already numerous application protocol standards in IBC, ranging from basic functionalities like token transfers [ICS20](https://github.com/cosmos/ibc/tree/main/spec/app/ics-020-fungible-token-transfer) to advanced functionalities like cross-chain validation [ICS28](https://github.com/cosmos/ibc/tree/main/spec/app/ics-028-cross-chain-validation) (also known as interchain security). **As a developer of IBC-enabled smart contracts, your challenge is to further develop IBC at this layer**.

2. **The Transport Layer** in IBC encodes **T**ransport, **A**uthentication, and **O**rdering (TAO) logic. The transport logic in IBC is _heavily inspired by that of TCP and UDP_, which won the protocol wars of the early internet for networking standards due to their open and net-neutral nature. Most competing interoperability protocols have overly simplistic transport layer implementations that lack TAO logic and accompanying specifications.

3. Most innovation in this space has been focused on **The State Layer**, examining how to move state (proofs) from one chain to another. All trust mechanisms below are encoded as clients in the IBC model. The [ICS02 client specification](https://github.com/cosmos/ibc/tree/main/spec/core/ics-002-client-semantics) allows for a variety of client types, encompassing most, if not all, trust mechanisms used in this space.

## Tackling Interoperability Fragmentation

Counterintuitively, the _transport layer_ is arguably the most crucial layer in the interoperability model. This layer creates a commitment to all messages sent and received from a chain, while also enforcing TAO logic. This commitment is known as a [_transport commitment_](../concepts/vibc/clients.md#fork-handling-and-virtual-roots).

Currently, transport commitments produced by one interoperability protocol are not understood by another, necessitating translation layers between protocols. This situation is anti-competitive and promotes vendor lock-in at the protocol level.

:::caution Interoperability Can Fragment the Landscape Too

While interoperability can be the solution to fragmentation in execution shards, it also potentially contributes to an extra source of it. Focused on conquering market share, most new interoperability protocols exacerbate the issues by introducing **incompatible transport layers, further fragmenting web3**.

:::

Failing to realize the opportunity to create a separation between layers in the interoperability model, increasing interoperability fragmentation remains a mostly ignored fact since all of the focus of builders and investors has been on the _state layer_ of interoperability as depicted above. 

By separating the diversity in verifying state at the state layer from the transport layer (which ideally should be a unified API), it is possible to achieve the best of both worlds without resulting fragmentation.

:::tip Developer First

_Who's ultimately going to be the victim of this fragmentation and incompatibility?_

We believe it's the developers (and through them, the end-users). At Polymer, we prioritize **putting developers first and striving for transport standards** that allow transferring skills and knowledge to any environment.

:::

<!-- ### Incentivization

Additionally, there are no protocol-level incentives that encourage open participation of clients at the state layer.

:::note Client Incentivization

With some of the IBC innovations that the Polymer Labs team is working on, client update incentivization will happen _in protocol_, ensuring an open market for clients.

::: -->

### IBC as the Standard

Rather than creating another incompatible transport layer, the Polymer Labs team is dedicated to **firmly establishing the open-source IBC (Inter-Blockchain Communication) protocol as the universal interoperability standard**. In other words, we advocate for transport commitments produced by every interoperability protocol to follow the IBC standard.

Although integrating and maintaining native IBC compatibility in a chain is normally quite challenging, Polymer, Ethereum's IBC interoperability hub, enables **integrating and adding IBC transport to any chain in a minimally intrusive manner**. The different interoperability protocols of today can opt to [become IBC clients in the network of tomorrow](../concepts/ibc/ibc-clients.md).


## Why Should You Care?

Through its efforts, Polymer plays a pivotal role in the widespread adoption of IBC as a transport layer standard.

You, **the developers of IBC applications, are the prime beneficiaries** of this push towards standardization because of the following benefits:

- [Flexibility in terms of state layer solutions encapsulated in the IBC client interface](../concepts/ibc/ibc-clients.md), ensuring they don't interfere with the standardization of transport commitments. This leads to a similar developer experience when developing cross-chain applications, regardless of the chains and ecosystems involved.
- No vendor lock-in, but open-source contributions and freedom of choice at the protocol level
- With [IBC as the transport layer standard](../concepts/ibc/ibc.md), efforts towards developer tooling, education, and support with respect to interoperability will grow much faster without fragmentation holding the space back.

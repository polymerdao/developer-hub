---
sidebar_position: 1
sidebar_label: 'Developer personas'
---

# Polymer developer personas

Due to its mission of becoming the interoperability hub of Ethereum, the Polymer ecosystem consists of different user personas. Here we'll focus on the developer/engineer/operator personas specifically.

The aim is to provide an overview of the main technical user personas, how they can interact with or build with Polymer and where to go next in the documentation.

## Polymer, Ethereum's IBC hub

Polymer is bringing IBC to Ethereum rollups. [IBC](../../learn/concepts/ibc/ibc.md) or the Inter-Blockchain communication protocol is a layered protocol that does a good job of separating the concerns of application developers, and core developers (consisting of transport and state layers).

Polymer as an IBC Hub takes care of the IBC transport layer, providing a straightforward and permissionless integration path, starting with OP stack rollups. Rollup chain devs or rollup framework devs are then potential users to integrate their rollups or frameworks with Polymer.

Not only on the application layer, we expect a varierty of builders to build. Also on the state layer, we expect a thriving market in IBC clients to arise by developers specializing in state verification along the security/latency/cost trade-off space.

As Polymer grows, it will become more decentralized and infra operators who will run relayers and verifier nodes for Polymer will also make up 

:::tip Polymer developer personas overview

Given this background, we can identify the following developer personas for Polymer:

- Application or dApp developers
- Chain/rollup core developers or rollup framework developers
- IBC client developers
- Polymer L2 node operators
- Relayer operators

:::

The following sections will give a description of the workflow for all of the above developer personas.

:::info Infra operators

Polymer L2 node operators and relayer operators are a significantly different user group and have a dedicated section for "infra operators".

:::


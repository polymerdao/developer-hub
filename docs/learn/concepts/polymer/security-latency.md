---
sidebar_position: 2
sidebar_label : 'Security vs latency'
---

# Security vs latency trade-off

Consider the following diagram to study the archictecture of Polymer, the interoperability hub connecting Ethereum rollups.

![Polymer rollup architecture](../../../../static/img/learn/polymer-stack.png)

In the previous section, all of the different components making up the Polymer chain were explained. But how does this translate when we send a packet? (This assumes that clients, connections and channels have been created.)

Generally speaking, the packet lifcycle is exactly as described [in the dedicated section on vIBC](../vibc/lifecycle.md). However, there's an important thing to remember when considering Polymer as Ethereum's interoperability hub:

:::tip Sharing the same settlement layer as the rollups Polymer connects to

As an rollup that settles onto Ethereum itself, Polymer has the advantage when connecting Ethereum rollups that we don't have any additional trust assumptions on a validator set or guardian set etc. but instead Polymer shares security with the rollups from the Ethereum stakers.

:::

In this section we will consider what this means for the clients we use and the security models as well as latency considerations.

## Security

:::caution 🚧
Work in progress, will follow soon.
:::

## Latency

:::caution 🚧
Work in progress, will follow soon.
:::
---
sidebar_position: 3
sidebar_label: 'Debug packet cycle'
---

# Events overview for vIBC

:::caution Disclaimer

The Polymer testnet is currently in an early public testnet phase. Please be aware that during this phase, the network may be subject to instability, downtime, and data resets. Read the full disclaimer [here](../disclaimer.md).

:::

When debugging the IBC packet lifecycle, the first step to take is to track down the packet during its lifecycle and where any potential issue arises.

As an application developer, you'll be mostly looking at the events on the chains your application(s) live on, not Polymer itself in the middle. 
Below you find the sequence of events for all possible situations.

:::note Ethereum L2 interoperability

When connecting Ethereum L2s that don't have native IBC implementations, the virtual <-> virtual case is applicable.

OP (Sepolia) to Base (Sepolia) is an example

:::

## Virtual to virtual

| Actor         | Virtual chain A              | Polymer                  | Virtual Chain B              |
|---------------------|------------------------------|--------------------------|------------------------------|
| vIBC Core SC         | SendPacket            | -                        | -                            |
| IBC module         | -                            | SendPacket               | -                            |
| IBC module         | -                            | RecvPacket               | -                            |
| vIBC Core SC         | -                            | -                        | RecvPacket        |
| vIBC Core SC         | -                            | -                        | WriteAck              |
| IBC module         | -                            | WriteAck                 | -                            |
| IBC module         | -                            | AcknowledgePacket        | -                            |
| vIBC Core SC         | AcknowledgePacket | -                        | -                            |

## Virtual (sender) to IBC native

| Actor         | Virtual chain A              | Polymer                  | IBC Chain B              |
|---------------------|------------------------------|--------------------------|------------------------------|
| vIBC Core SC         | SendPacket            | -                        | -                            |
| IBC module         | -                            | SendPacket               | -                            |
| IBC module         | -                            | -               | RecvPacket                            |
| IBC module         | -                            | -                 | WriteAck                            |
| IBC module         | -                            | AcknowledgePacket        | -                            |
| vIBC Core SC         | AcknowledgePacket | -                        | -                            |

## IBC native to Virtual (receiver)

| Actor         | Virtual chain A              | Polymer                  | Virtual Chain B              |
|---------------------|------------------------------|--------------------------|------------------------------|
| IBC module         | SendPacket                            | -               | -                            |
| IBC module         | -                            | RecvPacket               | -                            |
| vIBC Core SC         | -                            | -                        | RecvPacket        |
| vIBC Core SC         | -                            | -                        | WriteAck              |
| IBC module         | -                            | WriteAck                 | -                            |
| IBC module         | AcknowledgePacket                            | -        | -                            |

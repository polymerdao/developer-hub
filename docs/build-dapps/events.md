---
sidebar_position: 3
sidebar_label: 'Debug packet cycle'
---

# Events overview for vIBC

## Virtual to virtual

| Actor         | Virtual chain A              | Polymer                  | Virtual Chain B              |
|---------------------|------------------------------|--------------------------|------------------------------|
| vIBC Core SC         | VirtualSendPacket            | -                        | -                            |
| IBC module         | -                            | SendPacket               | -                            |
| IBC module         | -                            | RecvPacket               | -                            |
| vIBC module         | -                            | VirtualRecvPacketSend     | -                            |
| vIBC Core SC         | -                            | -                        | VirtualRecvPacket        |
| vIBC Core SC         | -                            | -                        | VirtualWriteAck              |
| IBC module         | -                            | WriteAck                 | -                            |
| IBC module         | -                            | AcknowledgePacket        | -                            |
| vIBC module         | -                            | VirtualAcknowledgePacketSend | -                        |
| vIBC Core SC         | VirtualAcknowledgePacket | -                        | -                            |

## Virtual (sender) to IBC native

| Actor         | Virtual chain A              | Polymer                  | IBC Chain B              |
|---------------------|------------------------------|--------------------------|------------------------------|
| vIBC Core SC         | VirtualSendPacket            | -                        | -                            |
| IBC module         | -                            | SendPacket               | -                            |
| IBC module         | -                            | -               | RecvPacket                            |
| IBC module         | -                            | -                 | WriteAck                            |
| IBC module         | -                            | AcknowledgePacket        | -                            |
| vIBC module         | -                            | VirtualAcknowledgePacketSend | -                        |
| vIBC Core SC         | VirtualAcknowledgePacket | -                        | -                            |

## IBC native to Virtual (receiver)

| Actor         | Virtual chain A              | Polymer                  | Virtual Chain B              |
|---------------------|------------------------------|--------------------------|------------------------------|
| IBC module         | SendPacket                            | -               | -                            |
| IBC module         | -                            | RecvPacket               | -                            |
| vIBC module         | -                            | VirtualRecvPacketSend     | -                            |
| vIBC Core SC         | -                            | -                        | VirtualRecvPacket        |
| vIBC Core SC         | -                            | -                        | VirtualWriteAck              |
| IBC module         | -                            | WriteAck                 | -                            |
| IBC module         | AcknowledgePacket                            | -        | -                            |

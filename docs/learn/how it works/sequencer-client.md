---
sidebar_position: 2
sidebar_label: 'Sequencer Client'
---


# Sequencer Client

The fastest way to read the state of a rollup is to track it at the sequencer level. OP Stack rollups have a well-defined P2P gossip network where the sequencer emits an 'ExecutionPayloadEnvelope' ([reference](https://github.com/ethereum-optimism/optimism/blob/dcdf2b7693192f5bca0353bf22729f26c6240ea9/op-service/eth/types.go#L196)), which contains the block header signed by the sequencer itself.



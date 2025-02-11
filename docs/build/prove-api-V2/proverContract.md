---
sidebar_position: 2
sidebar_label: 'Prover Contract'
---

# Prove API

## Prover Contract

### Overview

We deploy a contract known as the `CrossL2Prover` ([contract info](https://docs.polymerlabs.org/docs/build/start/)), taking inspiration from Superchain interop's [CrossL2Inbox](https://specs.optimism.io/interop/predeploys.html#crossl2inbox). Since we strongly believe in on-chain proofs, we have modified some methods to validate logs.

We plan to support more claims like `validateStorage` or `validateSrcHeader` as well as more methods like executeMessage that will send the safe payload to a defined address.

### Methods

**Validate any event with a single call.** For applications validating specific events emitted by their contracts on a given origin chain, these methods provide a straightforward, plug-and-play solution. 

1. `validateEvent`

Validates a cross-chain event from a counterparty chain and returns the event along with event identifiers. The function will revert if the validation fails.

```
validateEvent(bytes calldata proof) returns (uint32 chainId, address emittingContract, bytes memory topics, bytes memory unindexedData)
```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `proof` | Byte payload containing IAVL proof to application's log stored in Polymer Rollup and also the Sequencer attested State root and Block height of the same.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `chainId` | Chain ID of the emitting chain. _(identifier)_ |
| `emittingContract` | The contract which emitted the event. _(identifier)_ |
| `topics` | The topics array from the emitted event i.e. indexed data. |
| `unindexedData` | The ABI-encoded event data for the matched log i.e. unindexed data. |




<br/>

### More Advanced Methods (optional)

These methods were introduced to enhance transparency for applications that need to inspect the contents of a proof rather than blindly trusting opaque bytes. 

They enable applications to perform static calls to the contract, allowing them to examine various components of a proof—such as the corresponding origin chain transaction—to match against API inputs. Additionally, applications can inspect the Sequencer-attested root and block height, ensuring consistency with the public RPC.

1. `inspectLogIdentifier`

Inspect the origin transaction that a given proof corresponds to.

```
inspectLogIdentifier(bytes calldata proof) returns (uint32 srcChain, uint64 blockNumber, uint16 receiptIndex, uint8 logIndex)
```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `proof` | Byte payload containing IAVL proof to application's log stored in Polymer Rollup and also the Sequencer attested State root and Block height of the same.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `chainId` | Chain ID of the emitting chain. _(identifier)_ |
| `rlpEncodedBytes` | The raw RLP encoded bytes of the whole receipt object we are trying to prove, this is the value stored in the MMPT.|

<br/>

2. `parseLog`

A utility function for parsing log data from a receipt given an `logIndex` (within the transaction).
```
parseLog(uint256 logIndex, bytes calldata rlpEncodedBytes) returns (address emittingContract, bytes[] memory topics, bytes memory unindexedData)

```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `logIndex` | The index of the event in the logs array of the receipt. NOTE: This is not the log index within the block, only the log index within the receipt.|
| `proof` | This is returned from Polymer's proof API. This is generally an opaque bytes object but it is constructed through ABI encoding the proof fields from the above EventProof struct in this interface.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `emittingContract` | The contract which emitted the event. _(identifier)_ |
| `topics` | The topics array from the emitted event i.e. indexed data. |
| `unindexedData` | The ABI-encoded event data for the matched log i.e. unindexed data. |

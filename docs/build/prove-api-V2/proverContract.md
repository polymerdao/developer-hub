---
sidebar_position: 1
sidebar_label: 'Prover Contract'
---

# Prover Contract

### Overview

We deploy a contract known as the `CrossL2ProverV2` ([contract info](https://docs.polymerlabs.org/docs/build/start/)), taking inspiration from Superchain interop's [CrossL2Inbox](https://specs.optimism.io/interop/predeploys.html#crossl2inbox). Since we strongly believe in on-chain proofs, we have modified some methods to validate logs.

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
| `proof` | A byte payload containing the IAVL proof of the application's log stored in the Polymer Rollup, along with the Sequencer-attested state root and corresponding block height.|

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

<br/>

1. `inspectLogIdentifier`

Inspect the origin transaction that a given proof corresponds to-checked against API inputs.

```
inspectLogIdentifier(bytes calldata proof) returns (uint32 srcChain, uint64 blockNumber, uint16 receiptIndex, uint8 logIndex)
```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `proof` | A byte payload containing the IAVL proof of the application's log stored in the Polymer Rollup, along with the Sequencer-attested state root and corresponding block height.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `srcChain`     | Source chain that emitted the log. |
| `blockNumber`      | Block number on the source chain where the log was emitted. |
| `receiptIndex`             | Index of the transaction (receipt belongs to) in the array of all transactions in that block. |
| `logIndex`      | Index of the event in the logs array of the receipt i.e local to your transaction. _Note: This is not the global log index._  |

<br/>

2. `inspectPolymerState`

Inspect the root and the corresponding block height, verifying them against the public RPC endpoint.

```
inspectPolymerState(bytes calldata proof) returns (bytes32 stateRoot, uint64 height, bytes calldata signature)
```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `proof` | A byte payload containing the IAVL proof of the application's log stored in the Polymer Rollup, along with the Sequencer-attested state root and corresponding block height.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `stateRoot` | Represents the state of the Polymer Rollup, serving as the single source of truth. |
| `height` | The block height corresponding to the state, used for querying the public RPC. |
| `signature` | The sequencer's attestation, committing to the root and its associated block height. |

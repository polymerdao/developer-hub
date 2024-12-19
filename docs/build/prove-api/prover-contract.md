---
sidebar_position: 2
sidebar_label: 'Prover Contract'
---

# Prove API

## Prover Contract

### Overview

We deploy a contract known as the [CrossL2Prover](https://github.com/open-ibc/vibc-core-smart-contracts/blob/5c0789a3706252b712987ab851ed09fd1205e2f8/contracts/interfaces/ICrossL2Prover.sol), taking inspiration from Superchain interop's [CrossL2Inbox](https://specs.optimism.io/interop/predeploys.html#crossl2inbox). Since we strongly believe in on-chain proofs, we have modified some methods to validate receipts and logs for v0.

We plan to support more claims like `validateStorage` or `validateSrcHeader` as well as more methods like executeMessage that will send the safe payload to a defined address.

#### Current Capabilities:

- **Store Polymer Hub state:** Stores the latest app-hashes of the Polymer hub in a mapping against its block height. These app-hashes are what payloads are validated against.
- **Expose validation methods:** As an application, you can call pre-defined methods with API inputs in order to validate a payload and receive a boolean result.

[Contract Information](https://docs.polymerlabs.org/docs/build/start/)

### Methods

For applications validating specific events emitted by their contracts on a given origin chain, these methods provide a straightforward, plug-and-play solution. Validate any event with a single call.

- `validateEvent`

Validates a cross-chain event from a counterparty chain and returns the event along with event identifiers. The function will revert if the validation fails.

```
validateEvent(uint256 ,logIndex, bytes calldata proof) returns (bytes32 chainId, address emittingContract, bytes[] memory topics, bytes memory eventData)
```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `logIndex` | The index of the event in the logs array of the receipt. NOTE: This is not the log index within the block, only the log index within the receipt.|
| `proof` | The proof provided by Polymer's Proof API. This is an opaque byte object constructed via ABI encoding the fields of the EventProof struct.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `chainId` | Chain ID of the emitting chain. _(identifier)_ |
| `emittingContract` | The contract which emitted the event. _(identifier)_ |
| `topics` | The topics array from the emitted event i.e. indexed data. |
| `eventData` | The ABI-encoded event data for the matched log i.e. unindexed data. |




<br/>

### More Advanced Methods (optional)

For applications building advanced systems, such as batching multiple logs under a single receipt, these methods offer all the foundational tools needed to validate receipts and parse them for event data access. This approach optimizes proving costs by allowing developers to validate a single receipt and then iterate through and process each log independently, enhancing efficiency.

- `validateReceipt`

Validates a cross-chain receipt from a counterparty chain. The function will revert if the validation fails.

```
validateReceipt(bytes calldata proof) public view returns (bytes32 chainID, bytes memory rlpEncodedBytes)

```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `proof` | This is returned from Polymer's proof API. This is generally an opaque bytes object but it is constructed through ABI encoding the proof fields from the above EventProof struct in this interface.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `chainId` | Chain ID of the emitting chain. _(identifier)_ |
| `rlpEncodedBytes` | The raw RLP encoded bytes of the whole receipt object we are trying to prove, this is the value stored in the MMPT.|

- `parseLog`

A utility function for parsing log data from a receipt given an `logIndex` (within the transaction).
```
parseLog(uint256 logIndex, bytes calldata rlpEncodedBytes) returns (address emittingContract, bytes[] memory topics, bytes memory eventData)

```

| Inputs           | Description           |
| ---------------- | --------------------- |
| `logIndex` | The index of the event in the logs array of the receipt. NOTE: This is not the log index within the block, only the log index within the receipt.|
| `proof` | This is returned from Polymer's proof API. This is generally an opaque bytes object but it is constructed through ABI encoding the proof fields from the above EventProof struct in this interface.|

| Returns           | Description           |
| ----------------- | --------------------- |
| `emittingContract` | The contract which emitted the event. _(identifier)_ |
| `topics` | The topics array from the emitted event i.e. indexed data. |
| `eventData` | The ABI-encoded event data for the matched log i.e. unindexed data. |

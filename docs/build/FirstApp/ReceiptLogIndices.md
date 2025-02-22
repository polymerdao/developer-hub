---
sidebar_position: 0
sidebar_label: 'Understanding Receipts and Logs'
---

# Understanding Receipt and Log Indices

Let’s analyzes the transaction receipt structure from the [StateSync example](https://docs.polymerlabs.org/docs/build/examples/multi-rollup_apps/), specifically focusing on how events are emitted and structured in the transaction logs.

The receipt data is fetched using the `eth_getTransactionReceipt` RPC method.

![Receipt and Local Log Index](https://github.com/user-attachments/assets/1b0c6ad2-5f95-4bb8-a8cb-859558b367d6)

(In green box: Inputs required for Prove API)

## Contract Events

The StateSyncV2 contract emits three different events when setting a value ([example tx](https://optimism-sepolia.blockscout.com/tx/0xc2663a808b8a98b46d23aaaca7a9b584ffb717bf18b15f578bca7153296df913?tab=logs)):

1. **OnlyTopics** - Contains only indexed parameters (topics)

```solidity
event OnlyTopics(
    address indexed sender,      // topic[1]
    bytes32 indexed hashedKey,   // topic[2]
    uint256 indexed version      // topic[3]
);
```

1. **ValueSet** - Mixed indexed and non-indexed parameters

```solidity
event ValueSet(
    address indexed sender,      // topic[1]
    string key,                  // data
    bytes value,                 // data
    uint256 nonce,              // data
    bytes32 indexed hashedKey,   // topic[2]
    uint256 version             // data
);

```

1. **OnlyData** - Contains only non-indexed parameters

```solidity
event OnlyData(
    string key,                  // data
    bytes value,                 // data
    uint256 nonce,              // data
    string message              // data
);
```

## Transaction Receipt Structure

A transaction receipt contains multiple pieces of information:

1. Transaction hash
2. Block number
3. Gas used
4. Status (success/failure)
5. Array of logs (events)

### Receipt Index

- Each block contains multiple transactions
- Each transaction has one receipt
- Receipt or transaction index is the position of a transaction in the block
- Example: If a block has 5 transactions, receipt indices are 0-4

### Local Log Index

- Each receipt can contain multiple logs (events)
- Log index is the position of an event within a single receipt
- Local to the receipt (starts at 0 for each receipt)
- In our contract:
    - Log[0]: OnlyTopics event
    - Log[1]: ValueSet event
    - Log[2]: OnlyData event

## Example Structure

```
Block N
├── Receipt[0] (First transaction)
│   ├── Log[0] (OnlyTopics event)
│   ├── Log[1] (ValueSet event)
│   └── Log[2] (OnlyData event)
├── Receipt[1] (Second transaction)
│   ├── Log[0]
│   └── Log[1]
└── Receipt[2] (Third transaction)
    └── Log[0]
```

## Transaction Analysis

From our test transaction, we can see all three events in the logs:

### Log 1: OnlyTopics Event

```jsx
{
    topics: [
        '0x5f7211...', // Event signature hash
        '0x000000...f22a0aed5a05bf98fff814ad950eaf82fcea30cc', // sender
        '0x802618...40a41f8', // hashedKey
        '0x000000...02'  // version (2)
    ],
    data: '0x' // Empty data field (all params are topics)
}
```

### Log 2: ValueSet Event

```jsx
{
    topics: [
        '0x4fea41...', // Event signature hash
        '0x000000...f22a0aed5a05bf98fff814ad950eaf82fcea30cc', // sender
        '0x802618...40a41f8'  // hashedKey
    ],
    data: // ABI encoded non-indexed parameters:
        - key: "test-key"
        - value: "test-value"
        - nonce: 29
        - version: 2
}
```

### Log 3: OnlyData Event

```jsx
{
    topics: [
        '0x47048d...' // Only event signature hash
    ],
    data: // ABI encoded parameters:
        - key: "test-key"
        - value: "test-value"
        - nonce: 29
        - message: "State updated successfully"
}
```

## Key Points

1. **Topics vs Data**
    - Topics are indexed parameters, limited to 4 (1 for event signature + 3 for indexed params)
    - Data field contains all non-indexed parameters
    - Topics are more gas expensive but enable efficient event filtering
2. **Event Design Strategy**
    - OnlyTopics: Optimized for efficient querying
    - ValueSet: Balance of queryable and detailed data
    - OnlyData: Complete data but harder to filter
3. **Receipt Structure**
    - Each event creates a separate log entry
    - Logs are ordered as they appear in the contract
    - Each log contains its own topics and data fields

## Usage in Polymer Proof Generation

When requesting a proof, you need to specify:

1. Block number
2. Receipt index (which transaction in the block)
3. Local Log index (which event in the receipt)

Example:

```jsx
{
    blockNumber: 1234567,
    receiptIndex: 2,    // Third transaction in block
    logIndex: 1         // Second event in that transaction
}
```

### Practical Example

If you want to prove the `ValueSet` event from our contract:

1. Find the block number where transaction occurred
2. Use the transaction's position in block as receipt index
3. Use log index 1 (as ValueSet is the second event)

## ⚠️ Understanding Topic[0]: Event Signature

- Topic[0] is ALWAYS the keccak256 hash of the event signature
- Event signature format: `EventName(paramType1,paramType2,...)`
- Includes parameter types but not parameter names
- Used to identify which event was emitted

Example for our events:

```solidity
// OnlyTopics event
keccak256("OnlyTopics(address,bytes32,uint256)")
// → 0x5f7211... (topic[0])

// ValueSet event
keccak256("ValueSet(address,string,bytes,uint256,bytes32,uint256)")
// → 0x4fea41... (topic[0])

// OnlyData event
keccak256("OnlyData(string,bytes,uint256,string)")
// → 0x47048d... (topic[0])
```

### Topics Array Structure

For each log entry:

```jsx
topics: [
    topic[0], // Event signature hash (mandatory)
    topic[1], // First indexed parameter (optional)
    topic[2], // Second indexed parameter (optional)
    topic[3]  // Third indexed parameter (optional)
]
```

### Example from our Contract

```jsx
// ValueSet event log
{
    topics: [
        "0x4fea41..." // topic[0]: hash of "ValueSet(address,string,bytes,uint256,bytes32,uint256)"
        "0x000000...f22a", // topic[1]: indexed sender address (padded to 32 bytes)
        "0x802618...41f8"  // topic[2]: indexed hashedKey
    ],
    data: // ABI-encoded non-indexed parameters
}
```

### Why Topic[0] Matters

1. **Event Identification**
    - Smart contracts can emit multiple different events
    - topic[0] allows quick identification of event type
    - Essential for event filtering and processing
2. **Contract Verification**
    - In StateSyncV2's setValueFromSource():
    
    ```solidity
    bytes32 expectedSelector = keccak256("ValueSet(address,string,bytes,uint256,bytes32,uint256)");
    require(topicsArray[0] == expectedSelector, "Invalid event signature");
    ```
    
    - Ensures we're processing the correct event type
    - Prevents processing events from different contracts with similar structures
3. **Event Filtering within Relayer**
    - Can filter events by their signature (topic[0])
    - Common in blockchain explorers and event listeners
    - Example:
    
    ```jsx
    // Get transaction receipt
    const txReceipt = await provider.getTransactionReceipt(data.transactionHash);
    
    // Find local log index for ValueSet event
    const valueSetEventSignature = "ValueSet(address,string,bytes,uint256,bytes32,uint256)";
    const valueSetTopic = ethers.id(valueSetEventSignature);
    const localLogIndex = txReceipt.logs.findIndex(
        log => log.topics[0] === valueSetTopic
    );
    ```
    

## 📜 Why use Receipt and Local Log Index?

This receipt structure plays a crucial role in on-chain state proving because:

The consensus fields of a receipt—the fields that are RLP-encoded into the **ReceiptTrie**—are as follows:

```go
type Receipt struct {
	// Consensus fields: These fields are defined by the Yellow Paper
	Type              uint8
	PostState         []byte
	Status            uint64
	CumulativeGasUsed uint64
	Bloom             Bloom
	Logs              []*Log
}
```

The encoded **Log** fields, defined as:

```go
type Log struct {
	// Consensus fields:
	// Address of the contract that generated the event
	Address common.Address
	// List of topics provided by the contract
	Topics []common.Hash
	// Supplied by the contract, usually ABI-encoded
	Data []byte
}
```

At the chain consensus level, the **receipt index**, while not explicitly represented, is defined by the path taken from the **ReceiptTrie** root to the leaf node that stores the receipt. This path is encoded as **RLP(ReceiptIndex)**.

Similarly, the **log index** is encoded into the receipt as the position of a log within the **Logs** array.

This distinction may seem confusing when compared to the many fields present in a **Receipt** or **Log** object, such as those returned by the ETH JSON-RPC endpoints **eth_getTransactionReceipt** or **eth_getLogs**. These fields, like the **global log index**, are not included in the consensus encoding. Instead, they are supplementary fields, providing additional decorative information added to the returned receipt or log.

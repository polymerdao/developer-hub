---
sidebar_position: 0
sidebar_label: 'For Multi-Rollup Apps'
---


# Multi-Rollup Applications

Applications that embrace the "fat app" thesis are leveraging rollups as servers for their operations. These apps maintain contract instances on multiple chains, often requiring inter-contract communication for complex workflows.

**State Sync** is an interesting example that allows applications to synchronize key-value pairs across multiple chains in seconds. Learn more at [Polymer State Sync](https://github.com/dpbmaverick98/polymer-state-sync).

### End-to-End Overview

To understand the end-to-end flow, consider the following example: an application sets a key-value pair on one chain and then proves and updates this key-value pair on another chain. In this setup, the key-value pairs are stored against a sender address, which acts as a namespace, similar to AWS Redis.


<div style={{position: 'relative', paddingBottom: '59.31830676195712%', height: 0}}><iframe src="https://github.com/user-attachments/assets/e30bc067-5ef0-4338-8d02-be455181aabb" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></iframe></div>

<br/>

**Steps:**

1. The relayer monitors contracts for the latest events.
2. A value is set on Optimism.
3. The destination chain for synchronization is specified.

<br/>

### Origin Contract - Emit

Once the transaction on optimism is sent, the contract emits an event when the value is set.

```solidity
// Set or update a value
    function setValue(string calldata key, bytes calldata value) external {
        bytes32 hashedKey = keccak256(abi.encodePacked(msg.sender, key));

        // If key exists, only original sender can update
        if (keyOwners[hashedKey] != address(0)) {
            require(
                keyOwners[hashedKey] == msg.sender,
                "Not authorized to update this key"
            );
        } else {
            keyOwners[hashedKey] = msg.sender;
        }

        store[hashedKey] = value;
        uint256 currentNonce = nonces[msg.sender]++;
        uint256 newVersion = keyVersions[hashedKey] + 1;
        keyVersions[hashedKey] = newVersion;


        // Main event with both topics and data
        /**
        * event ValueSet(
        * address indexed sender,      // indexed (topic)
        * string key,                  // not indexed (data)
        * bytes value,                 // not indexed (data)
        * uint256 nonce,              // not indexed (data)
        * bytes32 indexed hashedKey,   // indexed (topic)
        * uint256 version             // not indexed (data)
        * );
        */

        emit ValueSet(
            msg.sender,
            key,
            value,
            currentNonce,
            hashedKey,
            newVersion
        );

    }
```

<br/>

### Relayer - Indexing, Requesting Prove API and Polling for Proof

Once the destination chain is defined, the application relayer requests the Prove API for proof of the event by providing the transaction index within the block. Since the relayer listens for the latest events, it already has the necessary information of the `ValueSet` event.

### 1. Receipt and Log Index Discovery
```javascript
// Get transaction receipt
const txReceipt = await provider.getTransactionReceipt(data.transactionHash);

// Find local log index for ValueSet event
const valueSetEventSignature = "ValueSet(address,string,bytes,uint256,bytes32,uint256)";
const valueSetTopic = ethers.id(valueSetEventSignature);
const localLogIndex = txReceipt.logs.findIndex(
    log => log.topics[0] === valueSetTopic
);
```

#### Key Components:
- **Transaction Receipt**: Contains all events emitted during transaction
- **Event Signature**: Keccak256 hash of the event definition
- **Local Log Index**: Position of ValueSet event in the receipt's logs array

### 2. Polymer API Proof Request
```javascript
const proofRequest = await axios.post(
    POLYMER_API_URL,
    {
        jsonrpc: "2.0",
        id: 1,
        method: "log_requestProof",
        params: [
            chainId,        // Source chain ID
            blockNumber,    // Block containing the event
            txIndex,        // Position of tx in block
            localLogIndex   // Position of event in receipt
        ]
    },
    {
        headers: {
            Authorization: `Bearer ${process.env.POLYMER_API_KEY}`,
        },
    }
);
```

#### Required Parameters:
1. **Chain ID**: Source chain identifier
2. **Block Number**: Block containing the transaction
3. **Transaction Index**: Position in block
4. **Log Index**: Position of event in receipt

### 3. Proof Generation Process
1. **Request Submission**
   - Submit proof request to Polymer API
   - Receive job ID for tracking

2. **Status Polling**
   ```javascript
   while (!proofResponse?.data?.result?.proof && attempts < maxAttempts) {
       proofResponse = await axios.post(
           POLYMER_API_URL,
           {
               jsonrpc: "2.0",
               method: "log_queryProof",
               params: [jobId]
           }
       );
   }
   ```
   - Poll every 500ms (Yes its that fast!)
   - Check proof generation status

3. **Proof Retrieval**
   - Once complete, receive proof in base64 format
   - Convert to hex for contract submission

<br/>

### Execution

Once the relayer receives the proof from the Prove API, it directly calls the application contract on the destination chain to execute the logic with `proof`. You can checkout this [decoding Prover Contract guide](https://docs.polymerlabs.org/docs/build/FirstApp/decodingProverReturn) to go over the following code snippet in depth. 

```solidity
function setValueFromSource(bytes calldata proof) external {
        // Step 1: Validate and decode the proof using Polymer's prover
        // Returns: sourceChainId, sourceContract, topics (3x32 bytes), and unindexed data
        (
            uint32 sourceChainId,
            address sourceContract,
            bytes memory topics,
            bytes memory unindexedData
        ) = polymerProver.validateEvent(proof);

        // Step 2: Split concatenated topics into individual 32-byte values
        bytes32[] memory topicsArray = new bytes32[](3);  // [eventSig, sender, hashedKey]
        require(topics.length >= 96, "Invalid topics length"); // 3 * 32 bytes

        // Use assembly for efficient memory operations when splitting topics
        assembly {
            // Skip first 32 bytes (length prefix of bytes array)
            let topicsPtr := add(topics, 32)
            
            // Load each 32-byte topic into the array
            // topicsArray structure: [eventSig, sender, hashedKey]
            for { let i := 0 } lt(i, 3) { i := add(i, 1) } {
                mstore(
                    add(add(topicsArray, 32), mul(i, 32)),
                    mload(add(topicsPtr, mul(i, 32)))
                )
            }
        }

        // Step 3: Verify this is the correct event type
        // This check is crucial for security:
        // 1. Ensures we're processing a ValueSet event, not any other event type
        // 2. Prevents processing of events from different contracts with same parameter structure
        // 3. Validates the exact parameter types and order match our expected format
        bytes32 expectedSelector = keccak256("ValueSet(address,string,bytes,uint256,bytes32,uint256)");
        require(topicsArray[0] == expectedSelector, "Invalid event signature");

        // Step 4: Extract indexed parameters from topics
        // Convert the padded address from bytes32 to address type
        address sender = address(uint160(uint256(topicsArray[1])));
        // Get the hashedKey directly (already bytes32)
        bytes32 hashedKey = topicsArray[2];

        // Step 5: Decode non-indexed event parameters
        // Original event: ValueSet(address indexed sender, string key, bytes value, uint256 nonce, bytes32 indexed hashedKey, uint256 version)
        (
            ,                       // skip key (we use hashedKey from topics)
            bytes memory value,     // actual value to store
            uint256 nonce,         // used for replay protection
            uint256 version        // used for version control
        ) = abi.decode(
            unindexedData, 
            (string, bytes, uint256, uint256)
        );

        // Step 6: Create and verify unique proof hash for replay protection
        bytes32 proofHash = keccak256(
            abi.encodePacked(sourceChainId, sourceContract, hashedKey, nonce)
        );
        require(!usedProofHashes[proofHash], "hashKey already used");
        usedProofHashes[proofHash] = true;

        // Step 7: Version control check
        require(
            version > keyVersions[hashedKey],
            "Version must be newer than current version"
        );
        keyVersions[hashedKey] = version;

        // Step 8: Update state
        store[hashedKey] = value;
        // Set the key owner if this is the first time this key is being used
        if (keyOwners[hashedKey] == address(0)) {
            keyOwners[hashedKey] = sender;
        }

        // Step 9: Emit event for indexing and tracking
        emit ValueUpdated(hashedKey, value, version);
    }
```

**Note:** The contract stores a unique hash to prevent replay attacks. Applications can customize this mechanism based on their logic.


## Advanced Use-Case of State Sync

Applications can submit key-value pairs to any chain, and the relayer automatically synchronizes the event across other contracts. This capability of the Prove API eliminates the need for predefined source-destination pairs. Once a contract emits an event, it becomes accessible across the Ethereum ecosystem.


### Compared to Messaging

One of the standout features of the Prove API is its ability to decouple applications from restrictive source and destination pairs. Once a contract emits an event, it can be utilized across all of Ethereum, reinforcing the vision of a unified Ethereum ecosystem.

Not only is this approach more straightforward, but it is also significantly more cost-effective than traditional messaging. With messaging, applications must configure all chains on both the source and destination sides, and send a new transaction on the source chain for each destination update—doubling the transaction costs for every update.


### End-to-End Demonstration

<div style={{position: 'relative', paddingBottom: '59.31830676195712%', height: 0}}><iframe src="https://github.com/user-attachments/assets/2182629a-4545-46af-8507-bdf148cb0553" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></iframe></div>

<br/>


- Once a transaction is sent, the relayer detects the event on the origin chain.
- The relayer requests proof from the Prove API simultaneously for multiple chains.
  - Polling intervals: Configured to wait 10 seconds with retries every 5 seconds.
- After obtaining the proof, the relayer updates the value across all specified chains.

RiftLend is a partners protocol that is building a Lending protocol deployed across multiple chains. It relies on synchronized updates for rates, parameters, and liquidations with similar broadcast style updates. Fun fact it uses both the Superchain interop and Prove API, to ensures a consistent development experience within the Superchain and across other OP stack and Arbitrum rollups.

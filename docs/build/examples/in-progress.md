---
sidebar_position: 0
sidebar_label: 'For Multi-Rollup Apps'
---


# Multi-Rollup Applications

Applications that embrace the "fat app" thesis are leveraging rollups as servers for their operations. These apps maintain contract instances on multiple chains, often requiring inter-contract communication for complex workflows.

**State Sync** is an interesting example that allows applications to synchronize key-value pairs across multiple chains in seconds. Learn more at [Polymer State Sync](https://github.com/stevenlei/polymer-state-sync).

### End-to-End Overview

To understand the end-to-end flow, consider the following example: an application sets a key-value pair on one chain and then proves and updates this key-value pair on another chain. In this setup, the key-value pairs are stored against a sender address, which acts as a namespace, similar to AWS Redis.


https://github.com/user-attachments/assets/e30bc067-5ef0-4338-8d02-be455181aabb


**Steps:**

1. The relayer monitors contracts for the latest events.
2. A value is set on Optimism.
3. The destination chain for synchronization is specified.

**Origin Contract - Emit**

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

    emit ValueSet(msg.sender, key, value, currentNonce, hashedKey);
}
```

**Relayer - Indexing, Requesting Prove API and Polling for Proof**

Once the destination chain is defined, the application relayer requests the Prove API for proof of the event by providing the transaction index within the block. Since the relayer listens for the latest events, it already has the necessary information of the `ValueSet` event.

**Indexing**

```solidity
// Listen for ValueSet events
this.contract.on(
  "ValueSet",
  async (sender, key, value, nonce, hashedKey, event) => {
    try {
      // Create a unique event identifier
      const eventId = `${event.log.blockHash}-${event.log.transactionHash}-${event.log.index}`;

      // Skip if we've already processed this event
      if (this.processedEvents.has(eventId)) {
        return;
      }

      // Get the block details
      const block = await this.provider.getBlock(event.log.blockNumber);

      // Wait for the transaction receipt
      const receipt = await event.log.getTransactionReceipt();

      // Get the position in the block
      const positionInBlock = receipt.index;

      console.log(
        chalk.blue(
          `\n🔔 New ValueSet event detected on ${chalk.bold(
            this.config.name
          )}:`
        )
      );
```

**Requesting Prove API**

```solidity
// Request proof from Polymer API
console.log(chalk.yellow(`>  Requesting proof from Polymer API...`));
const proofRequest = await axios.post(
  POLYMER_API_URL,
  {
    jsonrpc: "2.0",
    id: 1,
    method: "receipt_requestProof",
    params: [
      this.config.chainId,
      parseInt(destinationChain.chainId),
      data.blockNumber,
      data.positionInBlock,
    ],
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.POLYMER_API_KEY}`,
    },
  }
);
```

**Polling for Proof response**

```solidity
// Polling Prove API after 10 seconds for the first time, then every 5 seconds
let proofResponse;
let attempts = 0;
const delay = attempts === 0 ? 10000 : 5000;
while (!proofResponse?.data || !proofResponse?.data?.result?.proof) {
  if (attempts >= 10) {
    throw new Error(
      `Failed to get proof from Polymer API for ${destinationChain.name}`
    );
  }
  await new Promise((resolve) => setTimeout(resolve, delay));
  proofResponse = await axios.post(
    POLYMER_API_URL,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "receipt_queryProof",
      params: [jobId],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.POLYMER_API_KEY}`,
      },
    }
  );
```

**Execution** 

Once the relayer receives the proof from the Prove API, it directly calls the application contract on the destination chain to execute the logic with the `logIndex` and `proof`.

```solidity
// Function to be called by the relayer on the destination chain
function setValueFromSource(
    uint256 logIndex,
    bytes calldata proof
) external {
    // Validate the event using Polymer's prover
    (
        string memory sourceChainId,
        address sourceContract,
        bytes[] memory topics,
        bytes memory eventData
    ) = polymerProver.validateEvent(logIndex, proof);

    // Extract sender from topic[1] and hashedKey from topic[2]
    address sender = address(uint160(uint256(bytes32(topics[1]))));
    bytes32 hashedKey = bytes32(topics[2]);

    // Decode the unindexed event data
    (, bytes memory value, ) = abi.decode(
        eventData,
        (string, bytes, uint256)
    );

    // Create a unique hash of the proof to prevent replay attacks
    bytes32 proofHash = keccak256(
        abi.encodePacked(sourceChainId, sourceContract, proof)
    );
    require(!usedProofHashes[proofHash], "Proof already used");
    usedProofHashes[proofHash] = true;

    // Store the value and emit event
    store[hashedKey] = value;
    if (keyOwners[hashedKey] == address(0)) {
        keyOwners[hashedKey] = sender;
    }

    emit ValueUpdated(hashedKey, value);
}
```

**Note:** The contract stores a unique hash to prevent replay attacks. Applications can customize this mechanism based on their logic.

### Advanced Use Case of State Sync

Applications can submit key-value pairs to any chain, and the relayer automatically synchronizes the event across other contracts. This capability of the Prove API eliminates the need for predefined source-destination pairs. Once a contract emits an event, it becomes accessible across the Ethereum ecosystem.

**Compared to Messaging**

One of the standout features of the Prove API is its ability to decouple applications from restrictive source and destination pairs. Once a contract emits an event, it can be utilized across all of Ethereum, reinforcing the vision of a unified Ethereum ecosystem.

Not only is this approach more straightforward, but it is also significantly more cost-effective than traditional messaging. With messaging, applications must configure all chains on both the source and destination sides, and send a new transaction on the source chain for each destination update—doubling the transaction costs for every update.

**End-to-End Demonstration**


https://github.com/user-attachments/assets/2182629a-4545-46af-8507-bdf148cb0553


- Once a transaction is sent, the relayer detects the event on the origin chain.
- The relayer requests proof from the Prove API simultaneously for multiple chains.
  - Polling intervals: Configured to wait 10 seconds with retries every 5 seconds.
- After obtaining the proof, the relayer updates the value across all specified chains.

RiftLend is a partners protocol that is building a Lending protocol deployed across multiple chains. It relies on synchronized updates for rates, parameters, and liquidations with similar broadcast style updates. Fun fact it uses both the Superchain interop and Prove API, to ensures a consistent development experience within the Superchain and across other OP stack and Arbitrum rollups.

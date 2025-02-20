---
sidebar_position: 1
sidebar_label: 'Decoding Prover Return'
---


# Prover Return Decoding Guide

## Overview

This document explains how to interpret the returns from `CrossL2ProverV2` Contract with the following [example](https://docs.polymerlabs.org/docs/build/examples/multi-rollup_apps).

The `setValueFromSource` function takes in a proof from Prove API and uses it to validate and replicate a state change from a source chain to the destination chain. The process involves several steps of data validation and decoding.

## CrossL2Prover Interface

```solidity
function validateEvent(bytes calldata proof)
    returns (
        uint32 chainId,           // Source chain identifier
        address emittingContract, // Emitting contract address
        bytes topics,             // Concatenated Event topics
        bytes unindexedData       // Non-indexed event parameters
    )
```

### Raw Return Data

```jsx
[
    chainId,          // uint32: e.g., 11155420 (Optimism Sepolia)
    emittingContract, // address: 0x24B1D355f5B254aF86860bBe4214aEDe2DB1314E
    topics,           // bytes: topic1 + topic2 + topic3
    unindexedData     // hexbytes: abi encoded non-indexed parameters
]
```

## Origin Event Structure Reference

```solidity
event ValueSet(
	// → topic[0] = keccak(ValueSet(address,string,bytes,uint256,bytese32,uint256))
    address indexed sender,      // In topics[1]
    string key,                 // In unindexedData
    bytes value,                // In unindexedData
    uint256 nonce,             // In unindexedData
    bytes32 indexed hashedKey,  // In topics[2]
    uint256 version            // In unindexedData
);
```

## 1. Initial Proof Validation

```solidity
(
    uint32 sourceChainId,
    address sourceContract,
    bytes memory topics,
    bytes memory unindexedData
) = polymerProver.validateEvent(proof);
```

The Polymer prover returns four key pieces of information:

- `sourceChainId`: The chain ID where the event originated
- `sourceContract`: The contract address that emitted the event
- `topics`: A concatenated bytes of event topics (1-4 x 32 bytes)
- `unindexedData`: ABI-encoded non-indexed event parameters

## 2. Topics Decoding

The `topics` byte array contains three 32-byte values concatenated together:

```solidity
bytes32[] memory topicsArray = new bytes32[](3);
require(topics.length >= 96, "Invalid topics length"); // 3 * 32 bytes

assembly {
    let topicsPtr := add(topics, 32)  // Skip length prefix
    for { let i := 0 } lt(i, 3) { i := add(i, 1) } {
        mstore(
            add(add(topicsArray, 32), mul(i, 32)),
            mload(add(topicsPtr, mul(i, 32)))
        )
    }
}
```

The topics array contains:

1. `topicsArray[0]`: Event signature hash
2. `topicsArray[1]`: Indexed sender address (padded to 32 bytes)
3. `topicsArray[2]`: Indexed hashedKey


## 3. Event Signature Verification

```solidity
bytes32 expectedSelector = keccak256("ValueSet(address,string,bytes,uint256,bytes32,uint256)");
require(topicsArray[0] == expectedSelector, "Invalid event signature");
```

This security check ensures:

- Only ValueSet events are processed
- The parameter types and order match exactly
- Events from different contracts with similar structures are rejected

## 4. Indexed Parameter Extraction

```solidity
address sender = address(uint160(uint256(topicsArray[1])));
bytes32 hashedKey = topicsArray[2];
```

Converting indexed parameters:

- `sender`: Convert bytes32 → uint256 → uint160 → address
- `hashedKey`: Direct use (already bytes32)

## 5. Non-indexed Parameter Decoding

```solidity
(
    ,                       // skip key
    bytes memory value,
    uint256 nonce,
    uint256 version
) = abi.decode(
    unindexedData,
    (string, bytes, uint256, uint256)
);
```

The `unindexedData` contains ABI-encoded parameters that weren't indexed:

1. `key` (string): Skipped as we use hashedKey from topics
2. `value` (bytes): The actual value to store
3. `nonce` (uint256): Used for replay protection
4. `version` (uint256): Used for version control

 <br/>

### ⚠️ Important Security Considerations

This is a demonstration implementation. For production-ready applications, additional security measures are crucial:

1. **Source Chain Validation**:
    - Safeguards against event duplication from a different chain.
    - Maintain a whitelist of allowed source chains
    - Validate `sourceChainId` against this whitelist
    - Example:
        
        ```solidity
        require(allowedSourceChains[sourceChainId], "Invalid source chain");
        ```
        
2. **Source Contract Validation**:
    -Safeguards against event duplication from a different contract address on a given source chain.
    - Maintain a mapping of authorized contracts per chain
    - Verify the `sourceContract` address is authorized
    - Example:
        
        ```solidity
        require(
            authorizedContracts[sourceChainId][sourceContract],
            "Unauthorized source contract"
        );
        ```
        
3. **Event Signature Validation (topics[0])**:
    - Always verify the event signature hash (topics[0])
    - This is crucial as it validates both event name and parameter types
    - Example:
        
        ```solidity
        // Validates event name and exact parameter types/order
        bytes32 expectedSelector = keccak256("ValueSet(address,string,bytes,uint256,bytes32,uint256)");
        require(topicsArray[0] == expectedSelector, "Invalid event signature");
        
        // Even a slight change in parameters would generate a different hash:
        // "ValueSet(string,address,bytes,uint256,bytes32,uint256)" -> different hash
        // "ValueSet(address,bytes,string,uint256,bytes32,uint256)" -> different hash
        ```
        

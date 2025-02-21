---
sidebar_position: 3
sidebar_label: 'Intent Batched Settlement'
---

# Settlement Batcher Example

## Overview

Many intent protocols track a unique hash of user intents or user operations, often referred to as **invoiceIDs** or **orderIDs**, which are hashed over various parameters that define how the intent or operation is fulfilled. 

These protocols need to confirm these invoice hashes back on the source chain (the user-side lockup) in order to repay the solver for fronting capital on the destination chain.

[**polymer-invoice-batcher-example**](https://github.com/dpbmaverick98/polymer-invoice-batcher-example/tree/main) is a simple system designed to efficiently validate invoices across chains. It optimizes gas costs by batching multiple invoice IDs into a single cross-chain event.

**Compared to Messaging**

This simple yet highly efficient use case highlights the power of app-level interoperability, empowering app developers to manage cross-chain interaction, rather than relying on complex bridging APIs and contracts. These traditional systems can complicate matters with out-of-contract hooks and Merkle tree management as the only form of batching.

## End-to-End Flow

1. **Fill Submission (Invoice emission)**

    In this example, the `newInvoice` function is invoked, acting as a proxy for solver fills or post-Ops that emit and add the invoice hash to `pendingInvoices[]`. 
      
    
    ```solidity
    // User -> newInvoice() -> pendingInvoices[]
    
    /**
         * @notice Emitted when a new invoice is added to the pending batch
         * @param sender The address that added the invoice (can be the paymaster)
         * @param invoiceHash The hash of the invoice ID
         */
        event NewInvoice(
            address indexed sender,
            bytes32 indexed invoiceHash
        );
    ```
    
3. **Batching**

   At a later stage, the application relayer triggers the `batchInvoices` function, where all items in `pendingInvoices[]` are emitted in a single event, packed as unindexed data.
  
      

    ```solidity
    // Trigger -> batchInvoices() -> InvoiceBatch event
    
    /**
         * @notice Emitted when pending invoices are batched
         * @param sender The address that triggered the batch
         * @param invoices Array of invoice hashes in the batch
         */
        event InvoiceBatch(
            address indexed sender,
            bytes32[] invoices
        );
    
    // This transcation will be proved on the destination via Prove API 
    
    ```
    
5. **Cross-Chain Relay**

   The app relayer then calls the **Prove API** to seek proof of InvoiceBatch event and submits it to the `invoicesFromSource` function.
      
    
    ```solidity
    // Relayer -> Polymer API -> Get Proof -> invoicesFromSource()
    
    /**
         * @notice Processes a batch of invoices received from another chain
         * @param proof The Polymer proof data containing the cross-chain event
         * @dev Validates the proof using Polymer Prover and emits individual InvoiceReceived events
         * @dev Includes replay protection to prevent double-processing of proofs
         */
        function invoicesFromSource(bytes calldata proof) external {
            // Validate the proof using Polymer Prover
            (
                uint32 sourceChainId,
                address sourceContract,
                bytes memory topics,
                bytes memory data
            ) = polymerProver.validateEvent(proof);
    
            // Verify the source chain and contract are trusted
            require(sourceChainId != block.chainid, "Cannot process events from same chain");
            require(trustedSourceContracts[sourceChainId] != address(0), "Chain not trusted");
            require(sourceContract == trustedSourceContracts[sourceChainId], "Invalid source contract");
    
            // Decode the batch of invoice hashes from the event data
            bytes32[] memory invoices = abi.decode(data, (bytes32[]));
            
            // Extract the original sender from the event topics
            bytes32[] memory topicsArray = new bytes32[](2);
            assembly {
                let topicsPtr := add(topics, 32)
                mstore(add(topicsArray, 32), mload(add(topicsPtr, 32))) // Skip event signature, get sender
            }
            address sender = address(uint160(uint256(topicsArray[0])));
    
            // Emit individual events for each invoice in the batch
            for(uint i = 0; i < invoices.length; i++) {
                emit InvoiceReceived(sender, invoices[i]);
            }
        }
    ```
    
7. **Destination Repayment**

    Ideally, this function performs repayments to solvers by taking in the proof and additional call data. For the sake of this example, it simply emits `InvoiceReceived` to showcase successful repayment.
      
    
    ```solidity
    // Target Chain -> Validate Proof -> Process Batch -> InvoiceReceived events
    
    /**
         * @notice Emitted when an invoice is received from another chain
         * @param originalSender The address that sent the invoice on the source chain (can be the paymaster)
         * @param invoiceHash The hash of the received invoice ID
         */
        event InvoiceReceived(
            address indexed originalSender,
            bytes32 indexed invoiceHash
        );
    ```
    

## Gas Optimizations

### 1. Batching Benefits

- Instead of proving N individual events cross-chain
- Single batch event contains all invoices
- Proof validation cost remains nearly constant for given batch size

### 2. Event Data Structure

```solidity
event InvoiceBatch(
    address indexed sender,    // 20 bytes indexed
    bytes32[] invoices        // Dynamic array unindexed
)
```

- Only sender is indexed (fixed gas cost)
- Invoice array is unindexed (very efficient for large arrays)

### 3. Cost Comparison

For N invoices:

- Individual cross-chain messages: O(N) proofs
- Batched approach: ~ O(1) proof
- Savings increase with batch size

| Updating # of Invoices  | L2 execution cost | L1 data cost |
| --- | --- | --- |
| 1 | 150,000 | 16,250 |
| 5 | 162,000 | 18,000 |
| 10 | 176,000 | 20,200 |

Check out all sample transcations [here](https://docs.google.com/document/d/1ctt-eengG13NK_WS7V2ZkaQ9xeo_frYuzQSj24d0fG4/edit?tab=t.0#heading=h.jy36tgl3kknu).

---
sidebar_position: 1
sidebar_label: 'On-chain Proofs'
---

# How on-chain proofs work

## Native Proofs
Native proofs, such as receipt or storage proofs, are foundational blockchain components. These concepts, introduced in Bitcoin’s whitepaper, faced scalability challenges that limited their widespread adoption—until rollups utilized them for settling back to Ethereum. Rollups submit their state outputs, which attest to token holdings by accessing storage slots.

<img width="1408" alt="Screenshot 2024-12-19 at 8 09 30 AM" src="https://github.com/user-attachments/assets/16d82f35-9dee-4e4c-bb7e-10364994c854" />

<br/>
Since Polymer performs light-client updates, it has access to information within headers, including state roots and receipt roots. Thus can validate storage, receipts, or even logs within receipts.

:::tip

You can prove anything on-chain if you have the root and a proof path leading to the data being validated. [Here](https://medium.com/coinmonks/ethereum-data-transaction-receipt-trie-and-logs-simplified-30e3ae8dc3cf)’s an excellent resource to learn more about trie structures and Merkle proof paths:

_“(Data to Validate) — Merkle Proof Path —> Root == True if Correct”_

:::

## What is a transaction receipt and how to prove an event with it?

Transaction receipts are the final, provable records of a transaction's success, stored in the receipt Merkle trie on a given blockchain. Developers often use contract events to interact with their applications.

These events are emitted by smart contracts during execution but are not stored in the blockchain directly (its historical data). Instead, transaction receipts store the information needed to prove logs and events within those logs.

### Understanding Logs

Logs serve as a unique identifier of specific event data emitted by smart contracts during transaction execution. To validate events, developers need two key components:
- **Origin Contract Address:** The address of the contract that emitted the event.
- **Topics:** It is indexed parameters (first four) that categorize logs and allow for efficient searching.
- **Data:** This is the array of all the events emitted by the contract. 

Logs are structured within the transaction receipt but not a part of the blockchain itself because they are not required for consensus. However, they are verified by the blockchain since transaction receipt hashes, which include logs, are stored inside blocks.

To prove the existence of a specific receipt, a **Merkle proof** can be used. The proof ensures the integrity and inclusion of a receipt in the block, which allows validation of any associated logs or events.

### Simplifying Log Validation with the Polymer’s Prover Contract

The Polymer Prover contract abstracts away the complexities of log validation, allowing developers to focus on application logic. Here's how it simplifies the process:

1. **Pre-Built Proofs:** The Prove API returns a proof that encapsulates the entire validation path, including the transaction receipt, the superProof.
2. **Direct Submission:** Developers can directly submit this proof to the Prover contract without additional processing.
3. **Event Validation:** During validation, the Prover contract:
     - Returns the required application event.
     - Along with the event identifier, which includes:
         - **Origin Chain:** The source blockchain of the event.
         - **Emitter Contract:** The contract address that emitted the event.

“By leveraging the Polymer Prover contract, developers eliminate manual proof construction and log validation, streamlining cross-chain event verification and enhancing application efficiency.”

### Example: Transaction Receipt and Logs Structure

Here is a simple example to illustrate the above. Check out this transaction on [Optimism Sepolia Blockscout](https://optimism-sepolia.blockscout.com/tx/0x6f0ceb3035173924e5ed1df05b241403de64471fc92b82957357b56db305d5b7?tab=logs).

#### Exploring the Transaction
Once you open the link in your explorer, you will notice that the transaction emits a number of logs. The following image demonstrates the `eth_getTransactionReceipt` call made to an RPC.

![image](https://github.com/user-attachments/assets/11d3948e-d3d4-489a-b3d3-e1193b980aa0)

- **Transaction Index**: This transaction was the 5th transaction in the block, meaning it has a transaction index of `4` (indices are 0-based).

#### Log Details
- **Log Index in Block**: On the right side of each log, you can see the `logIndex` within the block. For example, the logs in this transaction start from `38` onward. The first four transactions in the block emitted the first 38 logs.
- **Log Index in Transaction**: Within the specific transaction/receipt, logs have their own indices starting from `0`. For instance, the first log in this transaction is indexed as `0` relative to this transaction's logs. This will act as the input in Prover Contract. 

This structure highlights how logs are uniquely indexed both globally within a block and locally within a transaction for accurate referencing.


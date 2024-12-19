---
sidebar_position: 1
sidebar_label: 'On-chain Proofs'
---

# How on-chain proofs work

Native proofs, such as receipt or storage proofs, are foundational blockchain components. These concepts, introduced in Bitcoin’s whitepaper, faced scalability challenges that limited their widespread adoption—until rollups utilized them for settling back to Ethereum. Rollups submit their state outputs, which attest to token holdings by accessing storage slots.

<img width="1408" alt="Screenshot 2024-12-19 at 8 09 30 AM" src="https://github.com/user-attachments/assets/16d82f35-9dee-4e4c-bb7e-10364994c854" />

Since Polymer performs light-client updates, it has access to information within headers, including state roots and receipt roots. Thus can validate storage, receipts, or even logs within receipts.

:::tip You can prove anything on-chain if you have the root and a proof path leading to the data being validated. [Here](https://medium.com/coinmonks/ethereum-data-transaction-receipt-trie-and-logs-simplified-30e3ae8dc3cf)’s an excellent resource to learn more about trie structures and Merkle proof paths:

_“(Data to Validate) — Merkle Proof Path —> Root == True if Correct”_

:::

## What is a transaction receipt and how to prove an event with it?

Transaction receipts are the final, provable records of a transaction's success, stored in the receipt Merkle trie on a given blockchain. Developers often use contract events to interact with their applications.

These events are emitted by smart contracts during execution but are not stored in the blockchain directly (its historical data). Instead, transaction receipts store the information needed to prove logs and events within those logs.

![AD_4nXdP4g1sp70jNFnRKShanaDzY4p4GrUfSvHrz4F1CB8Bba8A7WTGCZXQYeW3WMRy0UM4fYAX_Lq7199rQcOpjQBkgn7uaU2Y9jvRKhENFjqMNUwLAs5-ClTVehYNfejl_vRobYuE9w](https://github.com/user-attachments/assets/3f28c4dc-8d89-41db-87e5-1c43e1c1b166)

### Understanding Logs and Events

Logs serve as a unique identifier of events emitted by smart contracts during transaction execution. To validate events, developers need two key components:
- **Origin Contract Address:** The address of the contract that emitted the event.
- **Topics:** The method which was called to emit the said event. It is indexed parameters (up to four) that categorize logs and allow for efficient searching.
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
         - **Method:** The specific method that triggered the event by checking topics.

“By leveraging the Polymer Prover contract, developers eliminate manual proof construction and log validation, streamlining cross-chain event verification and enhancing application efficiency.”


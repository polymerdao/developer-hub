---
sidebar_position: 3
sidebar_label: 'Solana Receipt in Depth'
---

# Understanding Solana Transaction Receipts

Solana transaction receipts provide comprehensive information about executed transactions, including their status, signatures, involved accounts, and program execution logs. Understanding these receipts is crucial for developers working with cross-chain proof systems like Polymer. This guide breaks down the components of a Solana transaction receipt.

## Transaction Receipt Structure

Let's analyze the example transaction receipt:

```json
{
  "confirmationStatus": "finalized",
  "transaction": {
    "signatures": [
      "5DEqvtjapgcvkSRioBaYJ3S7huGae6QqddUd6dpxZvPSX74AeNe2fpt6NxzXFJ3n9i8VBAw4yCNBXLQgahDq7aZm"
    ],
    "message": {
      "header": {
        "numRequiredSignatures": 1,
        "numReadonlySignedAccounts": 0,
        "numReadonlyUnsignedAccounts": 1
      },
      "accountKeys": [
        "4Qmq3ZXESRWo7qiE4c96hEusD2U19NxMNRGb4aARXbLu",
        "9pWZ62qHrUxj4prsN9c5VroFzKRdCivnFJSkoYQ9ARxy",
        "J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa"
      ],
      "recentBlockhash": "DXVYAKVA25MWGqXj5zmETo8KhM9obntsHoq7cnErj8je",
      "instructions": [
        {
          "programIdIndex": 2,
          "accounts": [
            1,
            0
          ],
          "data": "JDn3X9ht6kygxByRsbDN2rhoC7HbGqS8Bmvwsr3vTDMD2pChY1ef"
        }
      ]
    }
  },
  "meta": {
    "err": null,
    "status": {
      "Ok": null
    },
    "fee": 5000,
    "preBalances": [
      320954160,
      1002240,
      1141440
    ],
    "postBalances": [
      320949160,
      1002240,
      1141440
    ],
    "innerInstructions": [],
    "logMessages": [
      "Program J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa invoke [1]",
      "Program log: Instruction: LogKeyValue",
      "Program log: Prove: Key: test-key, Value: test-value, Nonce: 1",
      "Program J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa consumed 5524 of 200000 compute units",
      "Program J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa success"
    ],
    "computeUnitsConsumed": 5524,
    "blockTime": 1747133731,
    "slot": 380576734
  }
}

```

## Transaction Information

### `transaction.signatures`

- Value: `["5DEqvtjapgcvkSRioBaYJ3S7huGae6QqddUd6dpxZvPSX74AeNe2fpt6NxzXFJ3n9i8VBAw4yCNBXLQgahDq7aZm"]`
- Meaning: Cryptographic signatures that authorized this transaction. In this case, there's one signature since `numRequiredSignatures` is 1.
- **Importance for Polymer:** The first signature is the transaction ID (txid) that you need to provide to the Polymer API when requesting a proof.

### `transaction.message.accountKeys`

- Values:
    - `"4Qmq3ZXESRWo7qiE4c96hEusD2U19NxMNRGb4aARXbLu"`: The signer (fee payer)
    - `"9pWZ62qHrUxj4prsN9c5VroFzKRdCivnFJSkoYQ9ARxy"`: The logger account (PDA)
    - `"J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa"`: The program ID
- Meaning: Lists all accounts involved in the transaction.
- **Importance for Polymer:** The program ID (`J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa`) is crucial for proof generation and must match the program that emitted the logs you want to prove.

### `meta.logMessages`

- Values:
    
    ```
    "Program J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa invoke [1]",
    "Program log: Instruction: LogKeyValue",
    "Program log: Prove: Key: test-key, Value: test-value, Nonce: 1",
    "Program J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa consumed 5524 of 200000 compute units",
    "Program J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa success"
    
    ```
    
- Meaning: Logs emitted during transaction execution.
- **Importance for Polymer:**
    - The program invocation log shows which program was called
    - The actual log with the "Prove:" prefix (`"Program log: Prove: Key: test-key, Value: test-value, Nonce: 1"`) is what will be extracted by the Polymer Prover
    - The success log confirms the transaction executed successfully

## Key Components for Polymer Proof Generation

When working with Polymer to prove logs from this transaction, you need three key pieces of information:

1. **Transaction Signature (Transaction ID)**
    - `5DEqvtjapgcvkSRioBaYJ3S7huGae6QqddUd6dpxZvPSX74AeNe2fpt6NxzXFJ3n9i8VBAw4yCNBXLQgahDq7aZm`
    - This is the unique identifier for the transaction.
2. **Program ID**
    - `J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa`
    - This is the program that emitted the logs you want to prove.
3. **Log with "Prove:" Prefix**
    - `"Program log: Prove: Key: test-key, Value: test-value, Nonce: 1"`
    - This is the specific log that will be extracted and proven by Polymer.

## Polymer Proof Request for This Transaction

To generate a proof for this transaction, you would make the following request to the Polymer API:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "polymer_requestProof",
  "params": [{
    "srcChainId": 2,
    "txSignature": "5DEqvtjapgcvkSRioBaYJ3S7huGae6QqddUd6dpxZvPSX74AeNe2fpt6NxzXFJ3n9i8VBAw4yCNBXLQgahDq7aZm",
    "programID": "J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa"
  }]
}

```

## Interpreting EVM-Verified Results

When verified on an EVM chain, the proof would return:

1. **Chain ID**: `2` (Solana)
2. **Program ID (hex)**: The hex representation of `J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa`
3. **Log Messages**: `["Key: test-key, Value: test-value, Nonce: 1"]` (note that the "Prove:" prefix is removed)

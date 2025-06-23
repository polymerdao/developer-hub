---
sidebar_position: 1
sidebar_label: 'Tron Proving'
---

# TRON Proof Validation Guide

## Overview

Cross-chain proof validation between TRON and EVM chains is fully compatible with proper address format handling. The key is understanding that:

1. **Data integrity is preserved** - all proof data remains identical
2. **Address formats differ** - TRON uses base58, EVM uses hex
3. **Hashing differs** - TRON uses `41…` prefix, EVM uses `0x…`

With proper format conversion, the same proof can be validated successfully on both TRON and EVM chains, providing true cross-chain interoperability.

| Network Information  | Tron Nile Testnet | Tron Mainnet  |
| --- | --- | --- |
| Chain ID | 3448148188 | 728126428 |
| Public RPC | [https://nile.trongrid.io](https://nile.trongrid.io/) | https://api.trongrid.io/jsonrpc |
| Explorer  | [nile.tronscan.org](https://nile.tronscan.org/#/) | [tronscan.org](https://tronscan.org/#/) |
| Prover Address  | [TN1hKC3qzkRzRgSCzmEY613KLjMJHqQ1Ly](https://nile.tronscan.org/#/contract/TN1hKC3qzkRzRgSCzmEY613KLjMJHqQ1Ly/code) | [TNKCTuonyurjAXBYpZtSZEo7WdFUKW9cbN](https://tronscan.org/#/contract/TNKCTuonyurjAXBYpZtSZEo7WdFUKW9cbN/code) |

This guide will show you how to validate cross-chain proofs on TRON compared to standard EVM chains with examples.

## EVM to Tron Proving

When validating proofs on TRON compared to standard EVM chains (like Base), there one important difference to note:

```tsx
// Validating same proof from Optimism on Base and Tron Prover Contract 

--- Base Sepolia Decoded Data (from main) ---
Chain ID: 11155420
Emitting Contract (EVM Hex): 0xB84644c24B4D0823A0770ED698f7C20B88Bcf824
Topics[]: 0xc0ae438737d82fdd04b48b08fb95c82fdbc3e4c6afb08e38f567a9351397a971...
Unindexed Data: 0x00000000000000000000000000000000000000000000000029a2241af62c000000000000000000000000000000000000000000000000000006f05b5e9c6541da...

--- Validating on TRON Nile (Decoded Output) ---
Calling Method 1: contract.at().validateEvent().call() approach...
✅ TRON Nile Decoded Validation Result: [
  11155420n,
  '41b84644c24b4d0823a0770ed698f7c20b88bcf824',
  '0xc0ae438737d82fdd04b48b08fb95c82fdbc3e4c6afb08e38f567a9351397a9710000000000000000000000004c79acd767b2d5aa121790c0311105912f7c4e95000000000000000000000000538ebe37bc7124b8649850886ba08a2005f76bfd000000000000000000000000538ebe37bc7124b8649850886ba08a2005f76bfd',
  '0x00000000000000000000000000000000000000000000000029a2241af62c000000000000000000000000000000000000000000000000000006f05b5e9c6541da00000000000000000000000000000000000000000000000006f05b5e9c6541da000000000000000000000000000000000000000000000000000000000000e7050000000000000000000000000000000000000000000000000000000000aa37dc',
  chainId: 11155420n,
  emittingContract: '41b84644c24b4d0823a0770ed698f7c20b88bcf824',
  topics: '0xc0ae438737d82fdd04b48b08fb95c82fdbc3e4c6afb08e38f567a9351397a9710000000000000000000000004c79acd767b2d5aa121790c0311105912f7c4e95000000000000000000000000538ebe37bc7124b8649850886ba08a2005f76bfd000000000000000000000000538ebe37bc7124b8649850886ba08a2005f76bfd',
  unindexedData: '0x00000000000000000000000000000000000000000000000029a2241af62c000000000000000000000000000000000000000000000000000006f05b5e9c6541da00000000000000000000000000000000000000000000000006f05b5e9c6541da000000000000000000000000000000000000000000000000000000000000e7050000000000000000000000000000000000000000000000000000000000aa37dc'
]

--- TRON Nile Decoded Data (from main) ---
Chain ID: 11155420
Emitting Contract (TRON Hex): 41b84644c24b4d0823a0770ed698f7c20b88bcf824
Topics[]: 0xc0ae438737d82fdd04b48b08fb95c82fdbc3e4c6afb08e38f567a9351397a971...
Unindexed Data: 0x00000000000000000000000000000000000000000000000029a2241af62c000000000000000000000000000000000000000000000000000006f05b5e9c6541da...

--- Comparison of Decoded Results ---
Chain ID: Match (11155420)
Emitting Contract: Match (after TRON hex conversion) (Base: 0xb84644c24b4d0823a0770ed698f7c20b88bcf824, TRON: 41b84644c24b4d0823a0770ed698f7c20b88bcf824 -> Compares as 0xb84644c24b4d0823a0770ed698f7c20b88bcf824)
Topics: Match
Unindexed Data: Match

```

### Return Value Notes

1. **Chain ID**:
    - Both chains return it as a number/BigNumber
    - No conversion needed
2. **Emitting Contract**:
    - Base returns: `0xB84644c24B4D0823A0770ED698f7C20B88Bcf824`
    - TRON returns: `41b84644c24b4d0823a0770ed698f7c20b88bcf824`
    - Need to handle conversion if comparing
3. **Topics and UnindexedData**:
    - Format is identical (hex strings)
    - No conversion needed
    - Both start with '0x'

## Tron to EVM Proving Example

**Example Transaction**: [b6235a7a2202b79528f0193cc3637178771a11bf8585b55fe09025df5f8ce989](https://nile.tronscan.org/#/transaction/b6235a7a2202b79528f0193cc3637178771a11bf8585b55fe09025df5f8ce989/event-logs)

![image](https://github.com/user-attachments/assets/d22d3d0d-1af0-4d42-b7d7-aab8665dcccd)

- TRON explorer shows base58 addresses with ‘T’ prefix
- Raw event data contains hex addresses without '0x' prefix ([Reference](https://developers.tron.network/docs/event#log) and output below)
- Whereas Base/EVM always uses '0x' prefix
- Data values (like amounts) are identical in hex

```tsx
=== TRON Transaction Raw Logs ===

Complete Raw Log Object:
[
  {
    "address": "eca9bc828a3005b9a3b909f2cc5c2a54794de05f",
    "topics": [
      "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0000000000000000000000003701e24fabdec5be006d04331b977d974a0e64c8",
      "000000000000000000000000d3ba0080540dd44a65e299d215c594a89c820fc5"
    ],
    "data": "0000000000000000000000000000000000000000000000000000000000989680"
  }
]

=== Raw Base Sepolia Validation Result ===

Raw Result Object:
[
  "3448148188",
  "0xECa9bC828A3005B9a3b909f2cc5c2a54794DE05F",
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef0000000000000000000000003701e24fabdec5be006d04331b977d974a0e64c8000000000000000000000000d3ba0080540dd44a65e299d215c594a89c820fc5",
  "0x0000000000000000000000000000000000000000000000000000000000989680"
]
```

### Address Formats

- **TRON Explorer Format**: `TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf` (Base58)
- **TRON Raw Log Format**: `eca9bc828a3005b9a3b909f2cc5c2a54794de05f` 
- **Base Prover Returns**: `0xECa9bC828A3005B9a3b909f2cc5c2a54794DE05F` (EVM Hex)
- **Note**: These are the same address in different formats. TRON uses base58 with 'T' prefix for display in explorer.

### Event Signature (Topic 0)

- **TRON Explorer and Raw Log shows:** ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
- **EVM Prover returned:**  0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
- **Meaning:** The only difference is that Base/EVM adds the 0x prefix when displaying addresses, but the underlying  address parameter format  is identical. Standard ERC20/TRC20 Transfer event signature.
- **Note**: This is identical on both networks as it's a keccak256 hash.

## Topics Handling and Unpacking

**Raw TRON Topic Format (Concatenated)**

```
topics: [
      "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0000000000000000000000003701e24fabdec5be006d04331b977d974a0e64c8",
      "000000000000000000000000d3ba0080540dd44a65e299d215c594a89c820fc5"
    ]
```

**After Unpacking Proof on Base**

```jsx
topics: [
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "0x3701e24fabdec5be006d04331b977d974a0e64c8",  
    "0xd3ba0080540dd44a65e299d215c594a89c820fc5"   
]
```

### Important Notes on Topic Unpacking

1. The prover automatically:
    - Splits concatenated topics into separate values
    - Removes '41' prefix from TRON addresses
    - Adds '0x' prefix to each topic
    - Maintains non-address topics as-is (e.g., uint256, bytes32)
2. For different data types:
    - **Addresses**: '41' prefix removed, '0x' added
    - **uint256**: Maintained as 32-byte hex, '0x' added
    - **bytes32**: Maintained as-is, '0x' added
    - **bool**: Padded to 32 bytes, '0x' added


## Tron Contract Interactions with TronWeb

### Static call 

#### Method 1: Using contract.at()

```jsx
const tronWeb = new TronWeb({
    fullHost: "<https://nile.trongrid.io>"  // or your TRON node
});

// Using base58 address format
const contract = await tronWeb.contract().at("TD39R92XN4HqXUQCPmtnZV1mhcgMy7Qbn8");
const result = await contract.validateEvent(proofHex).call();

// Result structure:
// {
//   chainId: BigNumber,
//   emittingContract: "41..." (TRON hex format),
//   topics: "0x..." (hex string),
//   unindexedData: "0x..." (hex string)
// }
```

#### Method 2: Using triggerConstantContract

```jsx
const functionSelector = 'validateEvent(bytes)';
const parameters = [{ type: 'bytes', value: proofHex }];
const result = await tronWeb.transactionBuilder.triggerConstantContract(
    "TD39R92XN4HqXUQCPmtnZV1mhcgMy7Qbn8",  // base58 address
    functionSelector,
    {},
    parameters
);

// Need to decode the raw result
const decodedTypes = ['uint32', 'address', 'bytes', 'bytes'];
const decoded = tronWeb.utils.abi.decodeParams(decodedTypes, result.constant_result[0]);
```

### **Submitting Transactions**

#### **Method 1: Using contract.methodName().send()**

```jsx
const tronWeb = new TronWeb({
    fullHost: "https://nile.trongrid.io",
    privateKey: "your_private_key_here"  // Required for sending transactions
});

// Get contract instance
const contract = await tronWeb.contract().at("TContractAddress123");

// Send transaction
const tx = await contract.transfer(recipientAddress, amount).send({
    feeLimit: 100_000_000,  // 100 TRX max fee
    callValue: 0,           // TRX to send with transaction
    shouldPollResponse: false // Don't wait for confirmation
});

// tx is the transaction ID (string)
console.log("Transaction ID:", tx);
```

#### **Method 2: Using triggerSmartContract (Recommended)**

```jsx
// More control and better error handling
const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
    "TContractAddress123",              // Contract address (base58)
    "transfer(address,uint256)",        // Full function signature
    {
        feeLimit: 100_000_000,         // In SUN (1 TRX = 1,000,000 SUN)
        callValue: 0                   // TRX value to send
    },
    [
        {type: 'address', value: recipientAddress},
        {type: 'uint256', value: amount}
    ],
    tronWeb.defaultAddress.base58      // Sender address
);

// Check if transaction was built successfully
if (!transaction.result || !transaction.result.result) {
    throw new Error('Transaction build failed: ' + transaction.result.message);
}

// Sign the transaction
const signedTx = await tronWeb.trx.sign(transaction.transaction);

// Broadcast the signed transaction
const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
console.log("Transaction ID:", receipt.txid);
```

**Note:**

1.TRON uses Energy & Bandwidth instead of gas

```jsx
// TRON uses Energy & Bandwidth instead of gas
// Check account resources before sending
const account = await tronWeb.trx.getAccountResources(address);
console.log("Energy:", account.EnergyLimit - account.EnergyUsed);
console.log("Bandwidth:", account.freeNetLimit - account.freeNetUsed);

// Set appropriate feeLimit (in SUN)
// 1 TRX = 1,000,000 SUN
const feeLimit = 100_000_000; // 100 TRX
```

2. TRON requires explicit type definitions

```jsx
// TRON requires explicit type definitions
const args = [
    {type: 'address', value: "TAddress123"},     // TRON addresses
    {type: 'uint256', value: "1000000"},         // Numbers as strings
    {type: 'bytes', value: "0x1234abcd"},        // Hex data
    {type: 'string', value: "Hello TRON"},       // Strings
    {type: 'bool', value: true}                  // Booleans
];

// Common type conversions
// EVM address to TRON: Use TronWeb.address.fromHex("0x...")
// TRON to hex: TronWeb.address.toHex("T...")
```

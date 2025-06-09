---
sidebar_position: 2
sidebar_label: 'Solana Proof Request'
---

# Proving Solana Logs on EVM

Once you have the proof, you can verify it on any EVM chain that has the Polymer validator contract deployed.

### EVM Validator Contract

The Polymer validator contract has a method to verify Solana logs:

```solidity
function validateSolLogs(bytes calldata proof)
    external
    view
    returns (uint32 chainId, bytes32 programID, string[] memory logMessages)

```

Parameters:

- `proof`: The base64-encoded proof converted to hex format (`0x` prefixed)

Returns:

- `chainId`: Source chain ID (2 for Solana)
- `programID`: Your Solana program ID (converted to a **bytes32/hex format**)
    - **Program ID Format**: Your Solana program ID will be returned as a hex value (bytes32), not in Base58 format.
- `logMessages`: Array of proven log messages that had the "Prove:" prefix
    - **Multiple Logs**: You can emit multiple logs with the "Prove:" prefix in a single transaction.

### Example Transaction Flow

1. **Emit a log on Solana**
    - Your transaction signature: `5r4AtXVBkcDmxtBay7RCpNnGCMv4RzX4Z5yqP2axMTzYY85Q3Tt3PKGtdk3m4Sqsfy7rCAb2Qp1F9rGs3xAdbo8C`
    - Your program ID: `J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa`
    - Your emitted log: `Prove: Key: solana, Value: hello, Nonce: 3`
2. **Request a proof from Polymer API**
    - Job ID received: `167462`
    - Proof data (base64 encoded)is returned
3. **Verify proof on EVM chain**
    - Prover contract for all EVM Chains: `0xabC91c12Bda41BCd21fFAbB95A9e22eE18C4B513`
    - Results:
        - Source Chain ID: `2`
        - Program ID (hex): `0xfe7f434fab7a0492fd8f969a0a7a20a136bcbc3d3730791e6340af32ecbb1cd3`
        - Verified Log Message: `Key: solana, Value: hello, Nonce: 3`

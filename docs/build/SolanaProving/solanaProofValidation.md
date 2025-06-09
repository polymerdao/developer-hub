---
sidebar_position: 2
sidebar_label: 'Solana Prover Validation'
---

# Proving Solana Logs on EVM

Once you have the proof, you can verify it on any EVM chain that has the Polymer validator contract deployed.

## EVM Prover Contract Interface 

The Polymer validator contract has a method to verify Solana logs:

```solidity
function validateSolLogs(bytes calldata proof)
    external
    view
    returns (uint32 chainId, bytes32 programID, string[] memory logMessages)

```

**Parameters:**

- `proof`: The base64-encoded proof converted to hex format (`0x` prefixed)

**Returns:**

- `chainId`: Source chain ID (2 for Solana)
- `programID`: Your Solana program ID (converted to **bytes32/hex format**)
    - **Program ID Format**: Your Solana program ID will be returned as a hex value (bytes32), not in Base58 format.
    - This is added for consistency in prover contract interfaces for EVM and Solana.
- `logMessages`: Array of proven log messages that had the "Prove:" prefix
    - **Multiple Logs**: You can emit multiple logs with the "Prove:" prefix in a single transaction.

## Log Format and Parsing

**Solana Log Format:**

```rust
msg!("Prove: program: {}, Key: {}, Value: {}, Nonce: {}",
     ctx.program_id, key, value, nonce);
// Output: "Prove: program: J8T7..., Key: solana, Value: hello, Nonce: 3"
```

**After Polymer Processing (Prove: prefix removed):**

```
"program: J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa, Key: solana, Value: hello, Nonce: 3"
```

**EVM Parsing Logic:**

```solidity
string[] memory parts = splitString(log, ",");
// parts[0] = "program: J8T7..."  (extract program ID from this)
// parts[1] = " Key: solana"
// parts[2] = " Value: hello"
// parts[3] = " Nonce: 3"

// Extract program ID:
string memory programPart = parts[0]; // "program: J8T7..."
string memory programId = extractAfterColon(programPart); // "J8T7..."
```

## Example Transaction Flow

1. **Emit a log on Solana**
    - Your transaction signature: `5r4AtXVBkcDmxtBay7RCpNnGCMv4RzX4Z5yqP2axMTzYY85Q3Tt3PKGtdk3m4Sqsfy7rCAb2Qp1F9rGs3xAdbo8C`
    - Your program ID: `J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa`
    - Your emitted log: `Prove: program: J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa, Key: solana, Value: hello, Nonce: 3`
2. **Request a proof from Polymer API**
    - Job ID received: `167462`
    - Proof data (base64 encoded) is returned
3. **Verify proof on EVM chain**
    - Prover contract for all EVM Chains: `0xabC91c12Bda41BCd21fFAbB95A9e22eE18C4B513`
    - **Verification Results:**
        - Source Chain ID: `2`
        - Program ID (hex): `0xfe7f434fab7a0492fd8f969a0a7a20a136bcbc3d3730791e6340af32ecbb1cd3`
        - Verified Log Message: `program: J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa, Key: solana, Value: hello, Nonce: 3`

## Example Verification Implementation

To properly verify Solana logs with runtime program ID security, implement dual verification:

```solidity
contract SolanaBridgeVerifier {
    IPolymerValidator public immutable polymerValidator;

    // Store trusted programs in both formats
    mapping(bytes32 => bool) public trustedPolymerIds;        // Polymer's bytes32 format
    mapping(bytes32 => bool) public trustedProgramHashes;     // Hash of Base58 strings
    mapping(bytes32 => bytes32) public polymerToHashMapping;  // Link the two formats

    constructor(address _polymerValidator) {
        polymerValidator = IPolymerValidator(_polymerValidator);

        // Add trusted program in both formats
        bytes32 polymerFormat = 0xfe7f434fab7a0492fd8f969a0a7a20a136bcbc3d3730791e6340af32ecbb1cd3;
        bytes32 programHash = keccak256(abi.encodePacked("J8T7Dg51zWifVfd4H4G61AaVtmW7GqegHx3h7a59hKSa"));

        trustedPolymerIds[polymerFormat] = true;
        trustedProgramHashes[programHash] = true;
        polymerToHashMapping[polymerFormat] = programHash;
    }

    function verifyUserAction(bytes calldata proof) external {
        // Get validation results from Polymer
        (uint32 chainId, bytes32 returnedProgramID, string[] memory logMessages) =
            polymerValidator.validateSolLogs(proof);

        // Verify chain ID is Solana
        require(chainId == 2, "Must be from Solana");

        // Step 1: Verify returned program ID is trusted
        require(trustedPolymerIds[returnedProgramID], "Untrusted program ID");

        // Step 2: Get expected hash for log verification
        bytes32 expectedProgramHash = polymerToHashMapping[returnedProgramID];
        require(expectedProgramHash != bytes32(0), "Missing program mapping");

        // Step 3: Verify each log contains matching program ID
        for (uint256 i = 0; i < logMessages.length; i++) {
            if (_startsWith(logMessages[i], "program: ")) {
                _verifyLogProgramId(logMessages[i], expectedProgramHash);
            }
        }
    }

    function _verifyLogProgramId(string memory log, bytes32 expectedHash) internal view {
        // Input: "program: J8T7..., Key: solana, Value: hello, Nonce: 3"
        // (Note: "Prove: " prefix already removed by Polymer)

        // Split by comma - clean parsing
        string[] memory parts = _splitString(log, ",");
        require(parts.length >= 2, "Insufficient log parts");

        // Extract program ID from first part: "program: J8T7..."
        string memory programPart = parts[0];
        string memory logProgramId = _extractAfterColon(programPart); // Gets "J8T7..."

        // Hash the extracted program ID and compare
        bytes32 logProgramHash = keccak256(abi.encodePacked(logProgramId));
        require(logProgramHash == expectedHash, "Log program ID mismatch");
    }

    function _extractAfterColon(string memory str) internal pure returns (string memory) {
        // Extract everything after ": " in "program: J8T7..."
        string[] memory parts = _splitString(str, ": ");
        require(parts.length >= 2, "No colon found");
        return _trim(parts[1]);
    }
}
```

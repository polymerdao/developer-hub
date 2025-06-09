---
sidebar_position: 1
sidebar_label: 'Request Solana Proof'
---

# Generating a Solana Log Proof

After your transaction has been confirmed on Solana, you'll need to request a state proof from Polymer's Prove API.

### Proof Request Endpoint

The Prove API follows a JSON-RPC format:

```
POST <https://proof.testnet.polymer.zone>
```

### API Authentication

Include your API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

### Proof Request Format

Here's the expected request format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "polymer_requestProof",
  "params": [{
    "srcChainId": 2, // Represents Solana within Polymer Network 
    "txSignature": "YOUR_SOLANA_TRANSACTION_SIGNATURE",
    "programID": "YOUR_SOLANA_PROGRAM_ID"
  }]
}

```

Parameters:

- `srcChainId`: 2 (representing Solana in Polymer's chain ID system)
- `txSignature`: The Solana transaction signature containing your log
- `programID`: Your Solana program ID that emitted the log (Base58 encoded)

### Proof Response and Polling

The initial response will include a job ID:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "167462"
}

```

You'll need to poll for the proof using this job ID:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "polymer_queryProof",
  "params": ["167462"]
}

```

The response will eventually include the proof when ready:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": "complete",
    "proof": "BASE64_ENCODED_PROOF_DATA"
  }
}

```


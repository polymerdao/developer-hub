---
sidebar_position: 2
sidebar_label: 'Error Handling'
---

This section outlines the error handling behavior of the proof generation API, specifically for the `log_requestProof` and `log_queryProof` methods. It details common validation errors, their error codes, messages, and failure reasons, based on tests conducted for chain ID, block number, receipt index, and log index validation.

### **API Methods Covered**

- **log_requestProof**: Requests proof generation for a given chain ID, block number, receipt index, and log index.
- **log_queryProof**: Queries the status of a proof generation job by job ID.

### **General Error Format**

Errors are returned in the JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": "error_code",
    "message": "error_message"
  }
}
```

For successful requests that later fail during processing, the error details are provided in the result field of the log_queryProof response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": "error",
    "jobID": "job_id",
    "failureReason": "failure_reason"
  }
}
```

# **Error Codes and Messages**

| **Scenario** | **Error Code** | **Message/Failure Reason** | **Immediate or Polled** |
| --- | --- | --- | --- |
| Unsupported Chain ID | -32000 | "chain ID not supported: chainId" | Immediate |
| Future Block Number | N/A | "src block number (x) greater than latest block number (y)" | Polled |
| Invalid Receipt Index | N/A | "invalid receipt index (x) for block number (y) with # receipts" | Polled |
| Invalid Log Index | N/A | "invalid log index (x) for receipt (y) on block number (z) with # logs" | Polled |

### **Polling Behavior**

- **Duration**: Proof status is polled for 20secs after a log_requestProof call returns a job ID.
- **Success Case**: If the proof generation succeeds, the status will be "completed" (not shown in these error tests).
- **Error Case**: If the proof fails, the status will be "error", accompanied by a failureReason.

**Recommendation**: Implement a polling loop in your application to check the job status until it resolves to "completed" or "error".

### **Best Practices for Developers**

1. **Pre-Validate Inputs**:
    - Check chainId against supported chains.
    - Ensure blockNumber is not in the future.
    - Verify receiptIndex and logIndex against block data.
2. **Handle Job IDs**:
    - Store the result (job ID) from log_requestProof and poll log_queryProof to monitor status.
3. **Graceful Error Recovery**:
    - Retry requests for future blocks once they are mined.
    - Adjust invalid indices based on chain data.

---

# **Error Examples**

### **1. Unsupported Chain ID**

**Description**: Occurs when the provided chainId is not supported by the system.

- **Method**: log_requestProof
- **Request Example**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "log_requestProof",
      "params": [123456789, 12345, 0, 0]
    }
    ```
    
- **Response**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "error": {
        "code": -32000,
        "message": "chain ID not supported: 123456789"
      }
    }
    ```
    
- **Error Code**: -32000 (Server error)
- **Message**: "chain ID not supported: chainId"
- **Condition**: The chainId parameter does not match any supported chain.

**Handling Tip**: Verify the chainId against the list of supported chains before making the request.

### **2. Future Block Number**

**Description**: Occurs when the requested blockNumber exceeds the latest block number on the chain. The request is accepted and assigned a job ID, but proof generation fails.

- **Method**: log_requestProof
- **Request Example**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "log_requestProof",
      "params": [84532, 21927382, 0, 0]
    }
    ```
    
- **Initial Response** (Success with Job ID):
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "result": 15327
    }
    ```
    
- **Polling Method**: log_queryProof
- **Polling Request**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "log_queryProof",
      "params": [15327]
    }
    ```
    
- **Polling Response**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "result": {
        "status": "error",
        "jobID": 15327,
        "blockNumber": 21927382,
        "logIndex": 0,
        "chainId": 84532,
        "createdAt": 1739621054,
        "updatedAt": 1739621056,
        "failureReason": "src block number (21927382) greater than latest block number (21926383)"
      }
    }
    ```
    
- **Failure Reason**: "src block number (x) greater than latest block number (y)"
- **Condition**: The blockNumber is in the future relative to the chain’s latest block height.

**Handling Tip**: Check the latest block number on the target chain before requesting a proof. Retry the request once the block is mined.

### **3. Invalid Receipt Index**

**Description**: Occurs when the requested receiptIndex is invalid for the specified block (e.g., exceeds the number of receipts). The request is accepted, but proof generation fails.

- **Method**: log_requestProof
- **Request Example**:json
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "log_requestProof",
      "params": [84532, 21926372, 99999, 0]
    }
    ```
    
- **Initial Response** (Success with Job ID):json
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "result": 15329
    }
    ```
    
- **Polling Method**: log_queryProof
- **Polling Request**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "log_queryProof",
      "params": [15329]
    }
    ```
    
- **Polling Response**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "result": {
        "status": "error",
        "jobID": 15329,
        "blockNumber": 21926372,
        "receiptIndex": 99999,
        "logIndex": 0,
        "chainId": 84532,
        "createdAt": 1739621058,
        "updatedAt": 1739621059,
        "failureReason": "invalid receipt index (99999) for block number (21926372) with 34 receipts"
      }
    }
    ```
    
- **Failure Reason**: "invalid receipt index (x) for block number (y) with # receipts"
- **Condition**: The receiptIndex exceeds the number of transaction receipts in the block.

**Handling Tip**: Validate the receiptIndex against the block’s transaction count before submitting the request.

### **4. Invalid Log Index**

**Description**: Occurs when the requested logIndex is invalid for the specified receipt (e.g., exceeds the number of logs). The request is accepted, but proof generation fails.

- **Method**: log_requestProof
- **Request Example**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "log_requestProof",
      "params": [84532, 21926372, 0, 999]
    }
    ```
    
- **Initial Response** (Success with Job ID):json
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "result": 15330
    }
    ```
    
- **Polling Method**: log_queryProof
- **Polling Request**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "log_queryProof",
      "params": [15330]
    }
    ```
    
- **Polling Response**:
    
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "result": {
        "status": "error",
        "jobID": 15330,
        "blockNumber": 21926372,
        "logIndex": 999,
        "chainId": 84532,
        "createdAt": 1739621062,
        "updatedAt": 1739621063,
        "failureReason": "invalid log index (999) for receipt (0) on block number (21926372) with 0 logs"
      }
    }
    ```
    
- **Failure Reason**: "invalid log index (x) for receipt (y) on block number (z) with # logs"
- **Condition**: The logIndex exceeds the number of logs in the specified receipt.

**Handling Tip**: Confirm the number of logs in the target receipt before requesting a proof.

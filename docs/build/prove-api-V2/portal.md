---
sidebar_position: 1
sidebar_label: 'Get API Key'
---

# Get your API key & credits

## 1. Log in and receive your key

<img width="3096" height="2178" alt="Accounts Image (1)" src="https://github.com/user-attachments/assets/052c4949-0d78-4ee5-94a4-9c8906d21f58" />

- Go to Polymer Portal: [accounts.polymerlabs.org](https://accounts.polymerlabs.org/)
- Sign in with Google — **we only support Google OAuth at this time**. (We currently support only one Google identity per developer/org.)
- The portal instantly creates your personal API key and drops you on the dashboard (Mainnet / Testnet toggle, 0 credits).

## 2. Buy credits

- Click the **“Purchase Credits”** button.
- Stripe checkout opens; choose any multiple of **10,000 credits**.
- Complete the payment—credits appear in your dashboard **immediately**.

<img width="3292" height="2424" alt="Accounts Image" src="https://github.com/user-attachments/assets/7b53fab9-b3c5-486c-8a17-4bc62f0f6190" />


### How credits are spent

- One credit ≠ one proof.
- Only the `proof_request` call costs credits; `proof_query` is free.
- Testnet is **completely free**—no purchase required—and uses its own Testnet-API key (visible in the testnet toggle).
- Mainnet credits are consumed at a customer-specific rate. Reach out to us before scaling so we can set (or adjust) your credits-per-proof ratio.

## 3. Make your first request

Replace `YOUR_API_KEY` below and run the two-step flow.

### 3a. Request the proof

```bash
curl -X POST <https://api.polymer.zone/v1/> \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "proof_request",
        "params": [{
          "srcChainId": 11155420, 
          "srcBlockNumber": 26421705, 
          "globalLogIndex": 15 
        }]
      }'

```

**Response**

```json
{"jsonrpc":"2.0","id":1,"result":123456}

```

Save the numeric `result`—that’s your `jobID`.

### 3b. Query for the proof

```bash
# Repeat every few seconds until status == "complete"
curl -X POST <https://api.polymer.zone/v1/> \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "proof_query",
        "params": ["123456"]
      }'

```

**Final response**

```json
{
  "jsonrpc":"2.0",
  "id":1,
  "result":{
    "status":"complete",
    "proof":"base64EncodedProofData..."
  }
}

```

Base64-decode the proof bytes, convert to hex, and submit them as call-data in your smart contract.

That’s it—your credits are deducted automatically and you can track your daily usage in Polymer Portal.

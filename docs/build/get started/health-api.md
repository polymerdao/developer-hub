---
sidebar_position: 4
sidebar_label: 'Health API'
---

# Polymer Chain Health API

Endpoint: `POST <https://api.polymer.zone/v1`>

JSON-RPC method: `info_health`

---

## 1. Quick start

```bash
# Global snapshot – every chain
curl -X POST <https://api.polymer.zone/v1> \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"info_health","params":[{}]}'

# Solver check – only the chains you quote
curl -X POST <https://api.polymer.zone/v1> \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"info_health","params":[{"chain_ids":[1,42161,8453]}]}'

```

---

## 2. Behaviour matrix

| Caller intent | Param shape | Returned data |
| --- | --- | --- |
| Big-picture dashboard | `params: [{}]` or `params: [{chain_ids:[]}]` | `status` map of **every** supported chain |
| Solver go/no-go | `params: [{"chain_ids":[<int>,…]}]` | `status` map **only** for the requested chains |

---

## 3. Request schema

JSON-RPC 2.0 envelope

Top-level keys: `jsonrpc`, `id`, `method`, `params`

`params` must be an **array with exactly one element**:

```tsx
type Params = [{}] | [{ chain_ids: number[] }];

```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `chain_ids` | `number[]` | no | Omit or pass empty array for global view.  |

---

## 4. Response schema

HTTP 200 + JSON-RPC envelope

Success body:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": {
      "< chainId >": "healthy" | "unhealthy",
      ...
    }
  }
}

```

Health rule

A chain is `"unhealthy"` when the **latest client update is older than 15 min**, otherwise `"healthy"`.

---

## 5. Examples

### 5.1 Global health

Request

```json
{"jsonrpc":"2.0","id":42,"method":"info_health","params":[{}]}
```

Response (truncated)

```json
{
  "jsonrpc":"2.0",
  "id":42,
  "result":{
    "status":{
      "1":"healthy",
      "137":"unhealthy",
      "42161":"healthy",
      ...all chains...
    }
  }
}
```

### 5.2 Solver quoting chains 1, 42161, 8453

Request

```json
{"jsonrpc":"2.0","id":7,"method":"info_health","params":[{"chain_ids":[1,42161,8453]}]}
```

Response

```json
{
  "jsonrpc":"2.0",
  "id":7,
  "result":{
    "status":{
      "1":"healthy",
      "42161":"healthy",
      "8453":"healthy"
    }
  }
}
```

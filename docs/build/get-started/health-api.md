---
sidebar_position: 4
sidebar_label: 'Check Polymer Health'
---

# Polymer Chain Health Endpoint 

**Endpoint:** `https://api.polymer.zone/v1`

**JSON-RPC method:** `info_health`

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

## 2. Behaviour matrix

| Caller intent | Param shape | Returned data |
| --- | --- | --- |
| Full health map | `params: [{}]` or `params: [{chain_ids:[]}]` | `status` map of **every** supported chain |
| Solver/Specific view | `params: [{"chain_ids":[<int>,…]}]` | `status` map **only** for the requested chains |

**Note:** `params` must be an **array with exactly one element**:

## 3. Response schema

**Success body:**

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

---

## 4. Examples

### 5.1 Global health

**Request:**

```json
{"jsonrpc":"2.0","id":1,"method":"info_health","params":[{}]}
```

**Response (truncated):**

```json
{
  "jsonrpc":"2.0",
  "id":1,
  "result":{
    "status":{
      "1":"healthy",
      "137":"unhealthy",
      "42161":"healthy",
      ...< all chains >...
    }
  }
}
```

### 5.2 Solver quoting chains 1, 42161, 8453

**Request:**

```json
{"jsonrpc":"2.0","id":1,"method":"info_health","params":[{"chain_ids":[1,42161,8453]}]}
```

**Response:**

```json
{
  "jsonrpc":"2.0",
  "id":1,
  "result":{
    "status":{
      "1":"healthy",
      "42161":"healthy",
      "8453":"healthy"
    }
  }
}
```

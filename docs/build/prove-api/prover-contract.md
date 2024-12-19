---
sidebar_position: 2
sidebar_label: 'Prover Contract'
---

# Prove API

## Prover Contract

### Overview

We deploy a contract known as the [CrossL2Prover](https://github.com/open-ibc/vibc-core-smart-contracts/blob/5c0789a3706252b712987ab851ed09fd1205e2f8/contracts/interfaces/ICrossL2Prover.sol), taking inspiration from Superchain interop's [CrossL2Inbox](https://specs.optimism.io/interop/predeploys.html#crossl2inbox). Since we strongly believe in on-chain proofs, we have modified some methods to validate receipts and logs for v0.

We plan to support more claims like `validateStorage` or `validateSrcHeader` as well as more methods like executeMessage that will send the safe payload to a defined address.

#### Current Capabilities:

- **Store Polymer Hub state:** Stores the latest app-hashes of the Polymer hub in a mapping against its block height. These app-hashes are what payloads are validated against.
- **Expose validation methods:** As an application, you can call pre-defined methods with API inputs in order to validate a payload and receive a boolean result.

[Contract Information](https://docs.polymerlabs.org/docs/build/start/)

### Methods

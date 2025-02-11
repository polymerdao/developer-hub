---
sidebar_position: 0
sidebar_label: 'Overview'
---

# Prove API V2

## Overview

### API for Requestion Proofs
The Prove API takes inspiration from Superchain's native interop to define an identifier. This version of the API is designed to prove individual logs.

### User Flow
Before an on-chain message can be sent, the "Appplication relayer" or "solver" must first query the Prove API.
1. **Request Proof:** Use the `log_requestProof` method to request a proof, which returns a `jobID`.
2. **Poll for Proof:** Use the `log_queryProof` method with the `jobID` to poll for proof responses.


Find info [here](https://docs.polymerlabs.org/docs/build/start/) to:
- Access the functions with POST requests to API end point
- Submit requests and experience the API
- Track your request from the our explorer


**Note:** Polymer is a rollup that continuously builds blocks and updates its state. As a result, proofs are most cost-effective within a recent time window. Currently, for testing purposes, we provide proofs for the last 3–4 hours, as proof retrieving data deeper in the rollup trie becomes increasingly expensive.

### On-chain Contract for Validating Proofs 




---
sidebar_position: 1
sidebar_label: 'At A Glance'
---

# Polymer at a Glance

<img 
  src="https://github.com/user-attachments/assets/90029f96-df63-4ef6-8ace-164155be9a38" 
  alt="Description" 
  style="width: 60%; display: block; margin: auto;" 
/>


### Off-chain API for Requesting Proofs
The Prove API takes inspiration from Superchain's native interop to define an identifier. This version of the API is designed to prove individual logs.

#### Current Capabilities:
Before an on-chain message can be sent, the "Appplication relayer" or "solver" must first query the Prove API.
1. **Request Proof:** Use the `log_requestProof` method to request a proof, which returns a `jobID`.
2. **Poll for Proof:** Use the `log_queryProof` method with the `jobID` to poll for proof responses.


Find info [here](https://docs.polymerlabs.org/docs/build/start/) to:
- Access the functions with POST requests to API end point
- Submit requests and experience the API
- Track your request from the our explorer

### On-chain Contract for Validating Proofs 

We deploy a contract known as the `CrossL2ProverV2` ([contract info](https://docs.polymerlabs.org/docs/build/start/)), which handles on-chain proof validation. This contract can be deployed permissionlessly on any EVM chain, enabling seamless access to Polymer and the ability to read data from all supported chains in the network.

#### Current Capabilities:

1. **Polymer State Validation:** Validates the state root of the Polymer rollup for a given block height, as attested by the sequencer. Ensures that the state root serves as the single source of truth within the network.
2. **Log Validation:** Exposes a predefined validation method that allows applications to verify logs using a provided proof. Enables applications to confirm the authenticity of a log and retrieve detailed log information securely.
3. **Proof Inspection:** Provides methods for applications to perform static calls to the contract to inspect different components of a proof. Enhances transparency by allowing applications to analyze proof data before submission.


**Note:** Polymer is a rollup that continuously builds blocks and updates its state. As a result, proofs are most cost-effective within a recent time window. Currently, for testing purposes, we provide proofs for the last 3–4 hours, as proof retrieving data deeper in the rollup trie becomes increasingly expensive.

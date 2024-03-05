---
sidebar_position: 1
sidebar_label: 'Network Information'
---

# Supported networks & dispatcher contracts

:::caution Disclaimer

The Polymer testnet is currently in an early public testnet phase. Please be aware that during this phase, the network may be subject to instability, downtime, and data resets. Read the full disclaimer [here](./disclaimer.md).

:::

Here you'll find an overview of the networks Polymer currently supports and where to find the address of the Dispatcher contract.

## Supported networks (testnet)

This table gives an overview of the important information for the networks Polymer supports currently. Note that when using IBC app in Solidity template to build apps, these are pre-populated in the environment file [here](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/.env.example).

| Network                  | Client Type | General Info & Resources | vIBC dispatcher | UC middleware |
| ------------------------ | ----------- | ------------------------ | ------------------------ | ------------------------ |
| OP Sepolia       | Proof-enabled | [Link](https://docs.optimism.io/chain/networks#op-sepolia)    | [Blockscout](https://optimism-sepolia.blockscout.com/address/0x58f1863F75c9Db1c7266dC3d7b43832b58f35e83) | [Blockscout](https://optimism-sepolia.blockscout.com/address/0x34a0e37cCCEdaC70EC1807e5a1f6A4a91D4AE0Ce) |
| Base Sepolia     | Proof-enabled | [Link](https://docs.base.org/network-information#base-testnet-sepolia)      | [Blockscout](https://base-sepolia.blockscout.com/address/0xfc1d3e02e00e0077628e8cc9edb6812f95db05dc)              | [Blockscout](https://base-sepolia.blockscout.com/address/0x50E32e236bfE4d514f786C9bC80061637dd5AF98) |
| OP Sepolia       | Sim client | [Link](https://docs.optimism.io/chain/networks#op-sepolia)    | [Blockscout](https://optimism-sepolia.blockscout.com/address/0x6C9427E8d770Ad9e5a493D201280Cc178125CEc0) | [Blockscout](https://optimism-sepolia.blockscout.com/address/0xC3318ce027C560B559b09b1aA9cA4FEBDDF252F5) |
| Base Sepolia     | Sim client | [Link](https://docs.base.org/network-information#base-testnet-sepolia)      | [Blockscout](https://base-sepolia.blockscout.com/address/0x0dE926fE2001B2c96e9cA6b79089CEB276325E9F)              | [Blockscout](https://base-sepolia.blockscout.com/address/0x5031fb609569b67608Ffb9e224754bb317f174cD) |

:::danger Sim client is fast, but less secure!

In the table below you'll find for each testnet a link to the Dispatcher and Universal channel middleware contracts for different kinds of clients. 

- The _sim client_ is meant to be used for prototyping and iterative development. It is faster, but **less secure**
- The _proof-enabled_ client goes through the channel or packet lifecycles with proofs provided by the relayer. This is slower, but more secure and representative of mainnet circumstances.

Be sure to move on to proof-enabled clients when your application logic looks sound.

:::

## Network information

Useful quick overview to add network information to your wallet etc. For more instructions visit the official docs for each network...

### OP Sepolia

| Parameter          | Value                                          |
|--------------------|------------------------------------------------|
| Network Name       | OP Sepolia                                     |
| Chain ID           | 11155420                                       |
| Currency Symbol1   | ETH                                            |
| Explorer           | https://sepolia-optimistic.etherscan.io        |
| Public RPC URL     | https://sepolia.optimism.io                    |
| Sequencer URL2     | https://sepolia-sequencer.optimism.io          |
| Contract Addresses | Refer to the [Contract Addresses page](https://docs.optimism.io/chain/addresses#testnet-sepolia)           |


### Base Sepolia

| Name           | Value                                  |
|----------------|----------------------------------------|
| Network Name   | Base Sepolia                           |
| Description    | A public testnet for Base.             |
| RPC Endpoint   | https://sepolia.base.org                |
|                | Rate limited and not for production systems. |
| Chain ID       | 84532                                  |
| Currency Symbol| ETH                                    |
| Block Explorer | https://sepolia-explorer.base.org      |

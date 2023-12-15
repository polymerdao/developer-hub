---
sidebar_position: 1
sidebar_label: 'Cross-chain Proof of Vote NFT - Part 1'
---

# Cross-chain Proof of Vote NFT - Part 1

:::info Prerequisites

This tutorial focuses on making existing Solidity contracts IBC compatible, so some prior knowledge is assumed:

- General EVM / Solidity knowledge
- Hardhat basics
- IBC and vIBC fundamentals, see [concepts](../category/concepts/) section 

Additionally you'll need the following software installed:
- [node](https://nodejs.org) (v18+) installed
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

:::

## Project introduction and setup

This dApp combines the [ballot contract from the Solidity docs](https://docs.soliditylang.org/en/v0.8.23/solidity-by-example.html#voting) and the [NFT contract from the Base intro to smart contract developement](https://docs.base.org/guides/deploy-smart-contracts).

The aim is to enable cross-chain minting of the NFT contract corresponding to a vote cast on the ballot contract on the counterparty. Therefore we **make the contracts IBC enabled** by implementing the [`IbcReceiver` interface](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/IbcReceiver.sol) as specified by the vIBC protocol.

:::caution Universal or custom channel?

Traditionally in IBC applications, each application would bind a port to the application and this port would own a channel end. This way the IBC channel functions as a _private lane_ for IBC traffic between the applications on both chains.

However, to enhance the developer experience for application developers, the vIBC protocol allows applications developers to use a **universal channel**. This is an unordered channel that is shared among many appications (contracts) and requires no channel handshake protocol before starting to send packets.

**This tutorial handles the case of custom channels, i.e. it will implement a function to trigger a channel handshake and implement the channel callbacks.**

Another tutorial for the same project that uses universal channels can be found [here](./tutorial2.md)...

:::

To start the tutorial, clone the following repo and check out the correct branch:
```bash
git clone git@github.com:polymerdao/demo-dapps.git && \
    cd demo-dapps/x-ballot-nft && \
    git switch start/x-ballot-nft
```
Then, install the dependencies:
```bash
npm install
```
### Store private keys

In the `hardhat.config.js` file in the root directory, you'll see that you need to define 3 private keys (can be the same for OP and Base), in an `.env` file to load them as an environment variable to sign transactions.

```javascript title="$ROOT_DIR/hardhat.config.js"
require("@nomicfoundation/hardhat-toolbox");

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
  },
  networks: {
    // for Base testnet
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [
        process.env.BASE_WALLET_KEY_1,
        process.env.BASE_WALLET_KEY_2,
        process.env.BASE_WALLET_KEY_3,
      ],
    },
    // for OP testnet
    'op-sepolia': {
      url: 'https://sepolia.optimism.io',
      accounts: [
        process.env.OP_WALLET_KEY_1, 
        process.env.OP_WALLET_KEY_2, 
        process.env.OP_WALLET_KEY_3,
      ],
    },    
  },
  defaultNetwork: 'hardhat',
};
```

```javascript title="$ROOT_DIR/.env"
// You can use the same private key for OP and Base Sepolia testnets
OP_WALLET_KEY_1 = '0x123456...'
OP_WALLET_KEY_2 = '0x123456...'
OP_WALLET_KEY_3 = '0x123456...'

BASE_WALLET_KEY_1 = '0x123456...'
BASE_WALLET_KEY_2 = '0x123456...'
BASE_WALLET_KEY_3 = '0x123456...'
```

## Implement `IbcReceiver` interface

In the `/contracts` folder, you'll find the `Ballot.sol` and `NFT.sol` contracts that correspond to the [ballot contract from the Solidity docs](https://docs.soliditylang.org/en/v0.8.23/solidity-by-example.html#voting) and the [NFT contract from the Base intro to smart contract developement](https://docs.base.org/guides/deploy-smart-contracts) respectively.

These are currently standalone contracts with the logic to vote on a proposal on the one hand and minting an NFT on the other hand. As part of this tutorial we'll implement cross-chain logic that allows a user to mint an NFT on Base Sepolia corresponding to a vote cast on OP Sepolia.

### Add callbacks

Look at the functions to add to Ballot.sol to make it IbcBallot.sol

### Create channel

Add dispatcher (constructor) and create-channel function

### Send packet

Add sendMintNFTMsg function in IbcBallot.sol

### Add callback logic

First look at IbcProofOfVoteNFT.sol for recvPacket, then Ack/Timeout on IbcBallot.sol

## Deploy and test

Now the contracts are finished and ready to deploy. You can do a final check to see if they compile:
```bash
# Optional
npx hardhat compile
```

### Deploy scripts

The Dispatcher address deployed by Polymer has been hard coded into the script, so all you need to do is run it with Hardhat:
```bash
# Deploy IbcBallot to OP Sepolia
npx hardhat run scripts/deploy-ballot.js --network op-sepolia

# Deploy IbcProofOfVote to Base Sepolia
npx hardhat run scripts/deploy-nft.js --network base-sepolia
```

Record the address the contracts are deployed at, you'll need to add them to the script to create a channel.

### Create channel script

### Vote and send packet script

## Explorer
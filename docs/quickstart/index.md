---
sidebar_position: 0
sidebar_label: 'Send a packet <5 mins'
---

# Quickstart: send a packet in under 5 mins

:::caution Disclaimer

The Polymer testnet is currently in a private testing phase. Please be aware that during this phase, the network may be subject to instability, downtime, and data resets. Read the full disclaimer [here](disclaimer.md).

:::

:::tip Goals

This quickstart tutorial aims to have you send an IBC packet from OP Sepolia to Base Sepolia with a minimal setup. This way you'll get a feel for the IBC packet lifecycle when using Polymer.

:::

:::info Prerequisites

This tutorial focuses on making existing Solidity contracts IBC compatible, so some prior knowledge is assumed:

- Hardhat/ethers.js basics (to interact with the contracts)
- IBC and vIBC fundamentals, see [concepts](../category/concepts-1) section 

Additionally you'll need the following software installed:
- [node](https://nodejs.org) (v18+) installed
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

:::

## Project introduction and setup

For this quickstart tutorial, you'll interact with a pair of contracts that have already been deployed for you to interact with. This dApp combines the [ballot contract from the Solidity docs](https://docs.soliditylang.org/en/v0.8.23/solidity-by-example.html#voting) and the [NFT contract from the Base intro to smart contract developement](https://docs.base.org/guides/deploy-smart-contracts).

The aim of the application is to enable cross-chain minting of the NFT contract corresponding to a vote cast on the ballot contract on the counterparty. In order to do so, the contracts referenced above need some refactoring to make them **IBC compatible**. How to do that is the subject of two other tutorials: [set up a custom channel](./tutorial1.md) or [use the universal channel](tutorial2.md), check those out to learn in depth how to create IBC enabled contracts.

To start the tutorial, clone the following repo and check out the correct branch:
```bash
git clone git@github.com:polymerdao/demo-dapps.git && \
    cd demo-dapps/x-ballot-nft-quickstart
```
Then, install the dependencies:
```bash
npm install
```
### Store your private keys

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

:::danger Don't share private keys

Make sure to ignore the file with your private keys when pushing your project to publicly available repositories.

:::

Now that you've added your private keys, you're ready to interact with the contract.

## Send an IBC packet

In the `/scripts` directory of the project you'll find the one script required to interact with the `IbcBallot` contract on OP Sepolia. 

To run it, simply execute:

```bash
npx hardhat run scripts/vote-and-send.js --network op-sepolia
```

<details>
<summary> What does the script do? </summary>
The detailed analysis of the application used for this quickstart, is provided in <a href="tutorial1">the extended tutorial</a>, but here's a summary:
<ul>    
    <li>It gets the accounts from your Hardhat configuration (which you've just set up by adding your private keys).</li>
    <li>It uses the first account provided to vote on a ballot. </li>
    <li>After having voted, it uses the same account to send an IBC packet with information about the vote to mint an NFT on the counterparty.</li>
    <li>It queries the contract for params that monitor packet acks.</li>
</ul>
</details>

:::note Deployed contracts

Note that the script includes the addresses of the deployed contracts, in case you want to write a custom script to interact with it:

```javascript
const ibcBallotAddress = '0xF30921b3b7173EeD0196279b25f9d88181c8d944' // add ibcBallot address when deployed
const ibcProofOfVoteNFTAddr = '0x04bD80D9bAbFC15Cb8411965A750b38cB8266eDf'
```
:::

### Packet gets relayed

Running the script results in an IBC packet being sent with information about a vote, to mint an NFT on the counterparty corresponding with the vote. Under the hood, what happens is that a `SendPacket` IBC event is emitted on OP Sepolia, a relayer monitoring the _universal channel_ will pick this up and relay the packet to Polymer etc. The entire IBC packet lifecycle needs to be completed until an acknowledgment is processed.

You'll see this happening in the terminal

```bash
Sending packet to mint NFT for 0xC0Fcf9248717D52c441064BA625807F361e766f5 relating to vote cast by 0xC0Fcf9248717D52c441064BA625807F361e766f5
ack not received. waiting...
# loop
ack not received. waiting...
Packet lifecycle was concluded successfully: true
```

The script is running a loop querying a parameter in the ballot contract that gets set when the IBC packet has been acknowledged. 

It seems like the packet has in fact been sent, but... how can you check?

## Packet monitoring

For additional data and debugging, you may want to access one of the following:

- [OP Sepolia block explorer](https://optimism-sepolia.blockscout.com/)
- [Base Sepolia block explorer](https://base-sepolia.blockscout.com/)
- [Polymer IBC explorer](http://35.236.98.227/packets)

The block explorers will reveal additional information about all of the transactions that make up the IBC packet lifecycle, but these general purpose explorers are not _IBC aware_ which is where the Polymer IBC explorer comes into the picture.

The IBC explorer provides more information about the IBC primitves like clients, connections, channels and the packet lifecycle. Additionally it provides some metrics in terms of latency and gas usage.

:::caution Work in progress 🚧
Some basic explorer and metrics functionality is available, but expect this to grow in terms of features set and UX in the near future.
:::

## Next steps

Now, that was it... you've sent an IBC packet over a universal channel. Now to understand better what was happening under the hood and how to develop IBC enabled contracts or applications yourself, follow along with the _Proof-of-Vote NFT_ tutorials that go in depth on how implement the relevant IBC interfaces.



---
sidebar_position: 1
sidebar_label: 'Proof-of-Vote NFT - Part 1'
---

# Cross-chain Proof-of-Vote NFT - Custom IBC channel

:::caution Disclaimer

The Polymer testnet is currently in a private testing phase. Please be aware that during this phase, the network may be subject to instability, downtime, and data resets. Read the full disclaimer [here](disclaimer.md).

:::

:::tip Goals

After going through this tutorial, developers will be able to:

- develop IBC enabled Solidity contracts or refactor existing ones
- write code to create custom IBC channels for their application
- write code to send or receive IBC packets

:::

:::info Prerequisites

This tutorial focuses on making existing Solidity contracts IBC compatible, so some prior knowledge is assumed:

- General EVM / Solidity knowledge
- Hardhat basics
- IBC and vIBC fundamentals, see [concepts](../category/concepts-1) section 

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
    cd demo-dapps/x-ballot-nft_STARTER
```

:::note Starter code vs finished code

To follow along with the tutorial you should use the starter files, as referenced above. If you want to check out the finished project, go to the `/x-ballot-nft` folder instead.

:::

Then, install the dependencies:
```bash
npm install
```
### Store private keys

In the `hardhat.config.js` file in the root directory, you'll see that you need to define 3 private keys (can be the same for OP and Base), in an `.env` file to load them as an environment variable to sign transactions.

Refer to [the quickstart tutorial](index.md) in case you need more information on how to do this.

:::danger Don't share private keys

Make sure to ignore the file with your private keys when pushing your project to publicly available repositories.

:::

## Implement `IbcReceiver` interface

In the `/contracts` folder, you'll find the `Ballot.sol` and `NFT.sol` contracts that correspond to the [ballot contract from the Solidity docs](https://docs.soliditylang.org/en/v0.8.23/solidity-by-example.html#voting) and the [NFT contract from the Base intro to smart contract developement](https://docs.base.org/guides/deploy-smart-contracts) respectively.

These are currently standalone contracts with the logic to vote on a proposal on the one hand and minting an NFT on the other hand. As part of this tutorial we'll implement cross-chain logic that allows a user to mint an NFT on Base Sepolia corresponding to a vote cast on OP Sepolia.

To upgrade the contracts to be IBC enabled contracts, you'll have to implement the `IbcReceiver` interface. For example, `Ballot.sol` becomes `IbcBallot.sol`:

```solidity
...
import "../node_modules/@open-ibc/vibc-core-smart-contracts/contracts/Ibc.sol";
import "../node_modules/@open-ibc/vibc-core-smart-contracts/contracts/IbcReceiver.sol";
import "../node_modules/@open-ibc/vibc-core-smart-contracts/contracts/IbcDispatcher.sol";

contract IbcBallot is IbcReceiverBase, IbcReceiver {
    // received packet as chain B
    IbcPacket[] public recvedPackets;
    // received ack packet as chain A
    AckPacket[] public ackPackets;
    // received timeout packet as chain A
    IbcPacket[] public timeoutPackets;
    bytes32[] public connectedChannels;

    string[] supportedVersions = ["1.0", "2.0"];
    ...
}
```

Same goes for `NFT.sol` which becomes `IbcProofOfVoteNFT.sol`.

Additonally you add storage variables to track received or timed out packets, acknowledged packets and connected channels.

:::note Supported versions

When the application creates a custom channel, it can support multiple versions. These versions will be compared during the channel handshake when version negotiation takes place. The channel can only be successfully created when both applications support at least one common version. 

:::

### Add callbacks

To implement the interface, you need to add callbacks. Refer to [Mars.sol](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/Mars.sol) to find the most basic implementation available and copy the callbacks into `IbcBallot.sol`.

The packet callbacks:

```solidity title="IbcBallot.sol"
    ...
    function onRecvPacket(IbcPacket calldata packet) external returns (AckPacket memory ackPacket) {
        recvedPackets.push(packet);
        return AckPacket(true, abi.encodePacked('{ "account": "account", "reply": "got the message" }'));
    }

    function onAcknowledgementPacket(IbcPacket calldata packet, AckPacket calldata ack) external {
        ackPackets.push(ack);
    }

    function onTimeoutPacket(IbcPacket calldata packet) external {
        timeoutPackets.push(packet);
    }
    ...
```

<!-- TODO: when vibc-core repo is stable for v0.1.0, just link there -->
and the channel callbacks:

```solidity title="IbcBallot.sol"
    ...
    function onOpenIbcChannel(
        string calldata version,
        ChannelOrder ordering,
        bool feeEnabled,
        string[] calldata connectionHops,
        string calldata counterpartyPortId,
        bytes32 counterpartyChannelId,
        string calldata counterpartyVersion
    ) external onlyIbcDispatcher returns (string memory selectedVersion) {
        if (bytes(counterpartyPortId).length <= 8) {
            revert invalidCounterPartyPortId();
        }
        /**
         * Version selection is determined by if the callback is invoked on behalf of ChanOpenInit or ChanOpenTry.
         * ChanOpenInit: self version should be provided whereas the counterparty version is empty.
         * ChanOpenTry: counterparty version should be provided whereas the self version is empty.
         * In both cases, the selected version should be in the supported versions list.
         */
        bool foundVersion = false;
        selectedVersion =
            keccak256(abi.encodePacked(version)) == keccak256(abi.encodePacked("")) ? counterpartyVersion : version;
        for (uint256 i = 0; i < supportedVersions.length; i++) {
            if (keccak256(abi.encodePacked(selectedVersion)) == keccak256(abi.encodePacked(supportedVersions[i]))) {
                foundVersion = true;
                break;
            }
        }
        require(foundVersion, "Unsupported version");
        // if counterpartyVersion is not empty, then it must be the same foundVersion
        if (keccak256(abi.encodePacked(counterpartyVersion)) != keccak256(abi.encodePacked(""))) {
            require(
                keccak256(abi.encodePacked(counterpartyVersion)) == keccak256(abi.encodePacked(selectedVersion)),
                "Version mismatch"
            );
        }

        return selectedVersion;
    }

    function onConnectIbcChannel(bytes32 channelId, bytes32 counterpartyChannelId, string calldata counterpartyVersion)
        external
        onlyIbcDispatcher
    {
        // ensure negotiated version is supported
        bool foundVersion = false;
        for (uint256 i = 0; i < supportedVersions.length; i++) {
            if (keccak256(abi.encodePacked(counterpartyVersion)) == keccak256(abi.encodePacked(supportedVersions[i]))) {
                foundVersion = true;
                break;
            }
        }
        require(foundVersion, "Unsupported version");
        connectedChannels.push(channelId);
    }

    function onCloseIbcChannel(bytes32 channelId, string calldata counterpartyPortId, bytes32 counterpartyChannelId)
        external
        onlyIbcDispatcher
    {
        // logic to determin if the channel should be closed
        bool channelFound = false;
        for (uint256 i = 0; i < connectedChannels.length; i++) {
            if (connectedChannels[i] == channelId) {
                delete connectedChannels[i];
                channelFound = true;
                break;
            }
        }
        require(channelFound, "Channel not found");
    }
    ...
```
:::info Add callback logic

You as developer can add custom logic on all of the callbacks defined above. Often though, developers will simply use the default channel callbacks with version negotiation without custom logic.

:::

### Create channel

To send packets, first a channel needs to be created on top of an existing connection. To do so, you'll add a function that will call the dispatcher contract. First we need to store the dispatcher address. We'll do it on the constructor.

```solidity
    ...
    /** 
     * @dev Create a new ballot to choose one of 'proposalNames'.
     * @param proposalNames names of proposals
     */
    constructor(bytes32[] memory proposalNames, address _dispatcher) IbcReceiverBase(_dispatcher) {
        chairperson = msg.sender;

        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            // 'Proposal({...})' creates a temporary
            // Proposal object and 'proposals.push(...)'
            // appends it to the end of 'proposals'.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }
    ...
```

And then provide a function to trigger channel creation by calling into the dispatcher's OpenIbcChannel` method:

```solidity
    /**
     * 
     * @param feeEnabled in production, you'll want to enable this to avoid spamming create channel calls (costly for relayers)
     * @param connectionHops 2 connection hops to connect to the destination via Polymer
     * @param counterparty the address of the destination chain contract you want to connect to
     * @param proof not implemented for now
     */
    function createChannel(
        bool feeEnabled, 
        string[] calldata connectionHops, 
        CounterParty calldata counterparty, 
        Proof calldata proof
        ) external {

        dispatcher.openIbcChannel(
            IbcReceiver(address(this)),
            supportedVersions[0],
            ChannelOrder.UNORDERED,
            feeEnabled,
            connectionHops,
            counterparty,
            proof
        );
    } 
```

The channel gets stored in your contract, for this tutorial we'll only create one so there's no need to worry about channel ID for now. But you can always query the contract from a JS library, e.g. ethers.js:
```javascript
const channelIdBytes = await ibcBallot.connectedChannels(0);
```

### Send packet

Once more you'll have to call into the dispatcher to send a packet of data over the created channel.

Here you'll have to decide upon what information to encode in the packet data. For this application, we'll send the address of the voter, a recipient address on the destination chain and the index of the voted proposal, voteId.

```solidity
    function sendMintNFTMsg(
        address voterAddress,
        address recipient,
    ) external payable {
        require(voters[voterAddress].ibcNFTMinted == false, "Already has a ProofOfVote NFT minted on counterparty");

        uint voteId = voters[voterAddress].vote;
        bytes memory payload = abi.encode(voterAddress, recipient, voteId);

        // hard coding for tutorial
        bytes32 channelId = connectedChannels[0]; 
        uint64 timeoutTimestamp = uint64((block.timestamp + 36000) * 1000000000);

        dispatcher.sendPacket(channelId, payload, timeoutTimestamp);
    }
```

Next to add payload (the packet data) in bytes, you need to provide the channel ID and a timestamp (hard coded at 10h) for timeouts.

### Add callback logic

The next step, now that we can send a packet from the IbcBallot contract, is to add the packet callback logic.

:::tip Uni- or bi-directional packet sends?

Depending on your application, packets can be sent from one side only or both sides. This will impact the packet callbacks. 

Consider the application in this tutorial: it only sends packets from the IbcBallot contract for the NFT contract to receive it and mint an NFT if successful. This mean that on the source we don't implement (or no-op) `onRecvPacket` and on the destination don't implement onAcknowledgement

:::

- **onRecvPacket in IbcProofOfVoteNFT.sol**

When the dispatcher on Base (destination) call into the application, it needs to decode the packet data, implement some logic and return an the data for an acknowledgement.

```solidity title="onRecvPacket callback"
    function onRecvPacket(IbcPacket calldata packet) external returns (AckPacket memory ackPacket) {
        recvedPackets.push(packet);

        (address decodedVoter, address decodedRecipient, uint decodedVoteId) = abi.decode(packet.data, (address, address, uint));

        uint256 voteNFTId = mint(decodedRecipient);

        bytes memory ackData = abi.encode(decodedVoter, voteNFTId);

        return AckPacket(true, ackData);
    }
```

We simply decode the packet data, mint an NFT and send back the NFT's id as well as the voter it represents, which we will use on the acknowledgement cycle.

- **onAcknowledgePacket in IbcBallot.sol**

When the source gets an acknowledgement back from the destination that the packet got received, we can add some additional logic. In this tutorial we will set a boolean value for our voter struct to indicate that the voter has an NFT minted on the destination.

Define the boolean,

```solidity title="Update voter struct in IbcBallot.sol"
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted;    
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
        // additional
        bool ibcNFTMinted; // if true, we've gotten an ack for the IBC packet and cannot attempt to send it again;  TODO: implement enum to account for pending state
    }
```

and use it to indicate that the packet has been acknowledged.
```solidity
    function onAcknowledgementPacket(IbcPacket calldata packet, AckPacket calldata ack) external {
        ackPackets.push(ack);

        // decode the ack data, find the address of the voter the packet belongs to and set ibcNFTMinted true
        (address voterAddress, uint256 voteNFTId) = abi.decode(ack.data, (address, uint256));
        voters[voterAddress].ibcNFTMinted = true;
    }
```
This will then prevent user from sending additional packets when the NFT has already been minted.

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

Update the addresses in the script to create a channel.

```javascript title="scripts/create-channel-ballot.js"
...
const dispatcherAddr = '0x7a1d713f80BFE692D7b4Baa4081204C49735441E'
const ibcBallotAddress = '' // add when IbcBallot contract is deployed
const ibcProofOfVoteNFTAddr = '' // DROP '0x' !!! add when IbcProofOfVoteNFT is deployed on counterparty
...
```

Now you can run the script to create a channel.

```bash
npx hardhat run scripts/create-channel-ballot.js --network op-sepolia
```

Consider the inputs used to call the `createChannel` function:

```javascript
  const tx = await ibcBallot.createChannel(
    false,
    ['connection-2', 'connection-1'],
    {
        portId: `polyibc.base.${ibcProofOfVoteNFTAddr}`,
        channelId: hre.ethers.encodeBytes32String(''),
        version: '',
    },
    {
        proofHeight: { revision_height: 0, revision_number: 0 },
        proof: hre.ethers.encodeBytes32String('abc')
    }

  );
```

<!-- Add some content about how to find the connections -->

### Vote and send packet script

Update the addresses in the script to vote and send a packet.

```javascript title="scripts/vote-and-send.js"
...
const ibcBallotAddress = '' // add when IbcBallot contract is deployed
...
```

Now you can run the script to create a channel.

```bash
npx hardhat run scripts/vote-and-send.js --network op-sepolia
```

Now you've sent the packet and the script tells you if the packet was sent successfully, but how do you check? There's many options to debug using block explorers for OP and Base Sepolia.

For example, check the block explorer for the Dispatcher to start verifying on [OP](https://optimism-sepolia.blockscout.com/address/0x7a1d713f80BFE692D7b4Baa4081204C49735441E) and [Base](https://base-sepolia.blockscout.com/address/0x749053bBFe3f607382Ac6909556c4d0e03D6eAF0).




---
sidebar_position: 2
sidebar_label: 'Proof-of-Vote NFT - Part 2'
---

# Cross-chain Proof-of-Vote NFT - Universal channel

:::caution Disclaimer

The Polymer testnet is currently in a private testing phase. Please be aware that during this phase, the network may be subject to instability, downtime, and data resets. Read the full disclaimer [here](disclaimer.md).

:::

:::tip Goals

After going through this tutorial, developers will be able to:

- develop IBC enabled Solidity contracts or refactor existing ones
- add your app to a middleware stack that includes the universal channel middleware
- write code to send or receive IBC packets over the universal channel

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

The aim is to enable cross-chain minting of the NFT contract corresponding to a vote cast on the ballot contract on the counterparty. Therefore we **make the contracts IBC enabled** by implementing the [`IbcUniversalPacketReceiver` interface](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/IbcMiddleware.sol#L73-L82) as specified by the [vIBC protocol](../learn/concepts/vibc/overview.md).

:::caution Universal or custom channel?

Traditionally in IBC applications, each application would bind a port to the application and this port would own a channel end. This way the IBC channel functions as a _private lane_ for IBC traffic between the applications on both chains.

However, to enhance the developer experience for application developers, the vIBC protocol allows applications developers to use a **universal channel**. This is an unordered channel that is shared among many appications (contracts) and requires no channel handshake protocol before starting to send packets.

**This tutorial handles the case of sending over the universal channel, i.e. you don't need to implement the channel callbacks but can start sending packets immediately after deploying your app.**

Another tutorial for the same project that uses custom channels can be found [here](./tutorial1.md)...

:::

To start the tutorial, clone the following repo and check out the correct branch:
```bash
git clone git@github.com:polymerdao/demo-dapps.git && \
    cd demo-dapps/x-ballot-nft_STARTER
```

:::note Starter code vs finished code

To follow along with the tutorial you should use the starter files, as referenced above. If you want to check out the finished project, go to the `/x-ballot-nft-UC` folder instead.

:::

Then, install the dependencies:
```bash
npm install
```
and the git submodules.

```bash
git submodule update --init --recursive
```
### Store private keys

In the `hardhat.config.js` file in the root directory, you'll see that you need to define 3 private keys (can be the same for OP and Base), in an `.env` file to load them as an environment variable to sign transactions.

Refer to [the quickstart tutorial](index.md) in case you need more information on how to do this.

:::danger Don't share private keys

Make sure to ignore the file with your private keys when pushing your project to publicly available repositories.

:::

## Implement `IbcUniversalPacketReceiver` interface

In the `/contracts` folder, you'll find the `Ballot.sol` and `NFT.sol` contracts that correspond to the [ballot contract from the Solidity docs](https://docs.soliditylang.org/en/v0.8.23/solidity-by-example.html#voting) and the [NFT contract from the Base intro to smart contract developement](https://docs.base.org/guides/deploy-smart-contracts) respectively.

These are currently standalone contracts with the logic to vote on a proposal on the one hand and minting an NFT on the other hand. As part of this tutorial we'll **implement cross-chain logic** that allows a user to mint an NFT on Base Sepolia corresponding to a vote cast on OP Sepolia.

To ensure the contracts can send IBC packets over a universal channel, you'll have to implement the [`IbcUniversalPacketReceiver` interface](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/IbcMiddleware.sol#L73-L82). For example, `Ballot.sol` becomes `IbcBallot.sol`:

```solidity title="Define interface(s) and add some variables to Ballot.sol"
...
import "../node_modules/@open-ibc/vibc-core-smart-contracts/contracts/Ibc.sol";
import "../node_modules/@open-ibc/vibc-core-smart-contracts/contracts/IbcMiddleware.sol";

contract IbcBallot is IbcMwUser, IbcUniversalPacketReceiver {
    ...
    /** 
     * 
     * IBC storage variables
     * 
     */ 

    struct UcPacketWithChannel {
        bytes32 channelId;
        UniversalPacket packet;
    }

    struct UcAckWithChannel {
        bytes32 channelId;
        UniversalPacket packet;
        AckPacket ack;
    }

    // received ack packet as chain A
    UcAckWithChannel[] public ackPackets;
    // received timeout packet as chain A
    UcPacketWithChannel[] public timeoutPackets;
    ...
}
```

Same goes for `NFT.sol` which becomes `IbcProofOfVoteNFT.sol` (similarly defining the interfaces and adding storage variables as above).

Additonally you add storage variables to track received, acknowledged or timed out packets.

:::note Who owns the channel?

Unlike the case in which the app creates a custom channel and owns the port, here it's **the uinversal channel middleware that owns the universal channel**. Therefore instead of storing connected channels in the contract, we add some helper types `UcPacketWithChannel` and `UcAckWithChannel` that adds the channelId to the universal packet. 

:::

### Add callbacks

To implement the interface defined above, you need to add callbacks. Refer to [Earth.sol](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/Mars.sol) to find the most basic implementation available and copy the callbacks into `IbcBallot.sol`.

The packet callbacks:

```solidity title="Add packet lifecycle callbacks to IbcBallot.sol"
    function onRecvUniversalPacket(bytes32 channelId, UniversalPacket calldata packet)
        external
        onlyIbcMw
        returns (AckPacket memory ackPacket)
    {
        recvedPackets.push(UcPacketWithChannel(channelId, packet));
        return AckPacket(true, abi.encodePacked(this, Ibc.toAddress(packet.srcPortAddr), "ack-", packet.appData));
    }

    function onUniversalAcknowledgement(bytes32 channelId, UniversalPacket memory packet, AckPacket calldata ack)
        external
        onlyIbcMw
    {
        // verify packet's destPortAddr is the ack's first encoded address. See generateAckPacket()
        require(ack.data.length >= 20, "ack data too short");
        address ackSender = address(bytes20(ack.data[0:20]));
        require(Ibc.toAddress(packet.destPortAddr) == ackSender, "ack address mismatch");
        ackPackets.push(UcAckWithChannel(channelId, packet, ack));
    }

    function onTimeoutUniversalPacket(bytes32 channelId, UniversalPacket calldata packet) external onlyIbcMw {
        timeoutPackets.push(UcPacketWithChannel(channelId, packet));
    }
```

Note that these are all slight variations of the _standard_ packet callbacks that implement ICS-26, see [part 1 of the tutorial](tutorial1.md).

:::tip No channel callbacks

Remember, the value proposition of universal channels is that you don't have to setup your own channel through a channel handshake. Therefore, there are no channel callbacks as well.

:::

No channel handshake, but instead using the universal channel (already set up) means that you can move straight on to implementing logic for sending, receiving and acknowledging or timing out packets.


### IBC vs Universal packets

Before implementing code to send packets, it makes sense to first consider _what packet_ exactly you're sending... .

Because the application using the universal channel, does not own the IBC channel they send their data on, extra information is needed to ensure delivery all the way through the middleware stack on the sender (at the very least containing the universal channel middleware), onto the destination side where it arrives at the universal channel middleware contract and is passed onto the middleware stack until it reaches the final destination.

:::tip Universal packet stores more than just app data into IBC packet data

Universal packet stores source and destination port adresses and middleware bitmap into a universal packet along with the application data. All of this is then packed into the IBC packet data field (bytes).

:::

On the sender side, a universal packet is packed into a regular IBC packet by the universal channel middleware contract and sent over the universal channel. From here on regular IBC behaviour happens.

On the receiver side, the Universal Channel middleware contract unpacks the regular IBC packet, extracts the universal packet, and passes it to the next middleware, if any, in the middleware stack, until it reaches the final destination specified in `UniversalPacket.destPortAddress` field.

```solidity title='IBC vs Universal packets (informational)'
/// IbcPacket represents the packet data structure received from a remote chain
/// over an IBC channel.
struct IbcPacket {
    /// identifies the channel and port on the sending chain.
    IbcEndpoint src;
    /// identifies the channel and port on the receiving chain.
    IbcEndpoint dest;
    /// The sequence number of the packet on the given channel
    uint64 sequence;
    bytes data;
    /// block height after which the packet times out
    Height timeoutHeight;
    /// block timestamp (in nanoseconds) after which the packet times out
    uint64 timeoutTimestamp;
}

// UniversalPacket represents the data field of an IbcPacket
struct UniversalPacket {
    bytes32 srcPortAddr;
    // source middleware ids bitmap, ie. logic OR of all MW IDs in the MW stack.
    uint256 mwBitmap;
    bytes32 destPortAddr;
    bytes appData;
}
```

### Send packets

Now let's see how to implement a method to send packets.

In [the tutorial with custom channels](tutorial1.md) you've seen how to send a packet by directly calling into the dispatcher's `sendPacket` method. However, when a middleware stack is involved (which is always the case when using the universal channel) you need to call the middleware directly above it in the stack instead.

In this example, the application only has the universal channel middleware in its stack. So you'll call into its `sendUniversalPacket` method. The UC MW contract will then call pack the universal packet as the IBC packet data on call into the dispatcher.

Additionally, you'll again have to decide upon what information to encode in the packet data. For this application, we'll send the address of the voter, a recipient address on the destination chain and the index of the voted proposal, voteId.

```solidity title="Add sendMintNFTMsg to IbcBallot.sol"
    ...
    function sendMintNFTMsg(
        address voterAddress,
        address recipient,
        address destPortAddress
    ) external payable {
        require(voters[voterAddress].ibcNFTMinted == false, "Already has a ProofOfVote NFT minted on counterparty");

        uint voteId = voters[voterAddress].vote;
        bytes memory payload = abi.encode(voterAddress, recipient, voteId);

        // hard coding for demo
        bytes32 channelId = 0x6368616e6e656c2d340000000000000000000000000000000000000000000000; 
        uint64 timeoutTimestamp = uint64((block.timestamp + 36000) * 1000000000);

        IbcUniversalPacketSender(mw).sendUniversalPacket(channelId, Ibc.toBytes32(destPortAddress), payload, timeoutTimestamp);
    }
```

Next to add payload (the packet data) in bytes, you need to provide the channel ID, the destination application's address and a timestamp (hard coded at 10h) for timeouts.

### Add callback logic

The next step, now that we can send a packet from the IbcBallot contract, is to add the packet callback logic.

:::tip Uni- or bi-directional packet sends?

Depending on your application, packets can be sent from one side only or both sides. This will impact the packet callbacks. 

Consider the application in this tutorial: it only sends packets from the IbcBallot contract for the NFT contract to receive it and mint an NFT if successful. This mean that on the source we don't implement (or no-op) `onRecvPacket` and on the destination (IbcProofOfVoteNFT) don't implement onAcknowledgement.

:::

- **onRecvUniversalPacket in IbcProofOfVoteNFT.sol**

When the dispatcher on Base (destination) calls into the application by passing down the middleware stack, it needs to decode the packet data (IBC and universal), implement some logic and return the data for an acknowledgement.

```solidity title="Add onRecvUniversalPacket callback to IbcProofOfVoteNFT.sol"
    function onRecvUniversalPacket(bytes32 channelId, UniversalPacket calldata packet) external onlyIbcMw returns (AckPacket memory ackPacket) {
        recvedPackets.push(UcPacketWithChannel(channelId, packet));

        (address decodedVoter, address decodedRecipient, uint decodedVoteId) = abi.decode(packet.appData, (address, address, uint));

        uint256 voteNFTId = mint(decodedRecipient);

        bytes memory ackData = abi.encode(decodedVoter, voteNFTId);

        return AckPacket(true, ackData);
    }
```

We simply decode the packet data, mint an NFT and send back the NFT's id as well as the voter it represents, which we will use on the acknowledgement cycle.

- **onUniversalAcknowledgement in IbcBallot.sol**

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
```solidity title="Add onUiversalAcknowledgement to IbcBallot.sol"
    function onUniversalAcknowledgement(bytes32 channelId, UniversalPacket calldata packet, AckPacket calldata ack) external onlyIbcMw {
        ackPackets.push(UcAckWithChannel(channelId, packet, ack));

        // decode the ack data, find the address of the voter the packet belongs to and set ibcNFTMinted true
        (address voterAddress, uint256 voteNFTId) = abi.decode(ack.data, (address, uint256));
        voters[voterAddress].ibcNFTMinted = true;
    }
```
The boolean will then prevent the voter from sending additional packets when the NFT has already been minted (to not waste gas).

## Deploy and test

Now the contracts are finished and ready to deploy. You can do a final check to see if they compile:
```bash
# Optional
npx hardhat compile
```

### Deploy scripts

The [Dispatcher address](../build/supp-networks.mdx) deployed by Polymer has been hard coded into the script, so all you need to do is run it with Hardhat:
```bash
# Deploy IbcBallot to OP Sepolia
npx hardhat run scripts/deploy-ballot.js --network op-sepolia

# Deploy IbcProofOfVote to Base Sepolia
npx hardhat run scripts/deploy-nft.js --network base-sepolia
```

Record the address the contracts are deployed at, you'll need to add them to the script to create a channel.

### Vote and send packet script

Update the addresses in the script to vote and send a packet.

```javascript title="scripts/vote-and-send.js"
...
const ibcBallotAddress = '' // add when IbcBallot contract is deployed
...
```

There's no need to create a channel, so go straight ahead to voting and sending the vote data over IBC.

```bash
npx hardhat run scripts/vote-and-send.js --network op-sepolia
```

Now you've sent the packet and the script tells you if the packet was sent successfully, but how do you check? There's many options to debug using block explorers for OP and Base Sepolia.

For example, check the block explorer for the Dispatcher to start verifying on [OP](https://optimism-sepolia.blockscout.com/address/0xD92B86315CBcf9cC612F0b0542E0bE5871bCa146) and [Base](https://base-sepolia.blockscout.com/address/0xab6AEF0311954C40AcD4D1DED56CAAE9cc074975).
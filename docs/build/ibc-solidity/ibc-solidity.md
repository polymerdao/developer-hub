---
sidebar_position: 2
sidebar_label: 'IBC in Solidity'
---

# Build IBC enabled contracts in Solidity

:::info Building cross-chain applications
Remember the interoperability model with the separation of layers?

- **application layer**
- transport layer
- state layer

IBC enabled smart contracts act as IBC application modules, effectively the application layer in the interop model.
:::

Building IBC enabled contracts will be your concern as a cross-chain application developer (xDapp dev), the transport and state layers are taken care of by Polymer and vIBC.

## IBC application requirements

From the [IBC documentation on IBC apps](https://ibc.cosmos.network/main/ibc/apps/apps.html), these are the tasks to implement to make your smart contract IBC enabled:

### For you to implement

- implement the `IBCModule` interface, i.e.:
  - channel (opening) handshake callbacks
  - channel closing handshake callbacks
  - packet callbacks
- define your own packet data and acknowledgement structs as well as how to encode/decode them

### For Polymer and vIBC to implement

- Bind to a port(s): This will be performed automatically by Polymer so you as dapp developer do not need to be concerned with the port binding. The port ID is simply the contract address with a prefix;`IBC_PortID` =` portPrefix` + `IBC_ContractAddress `. 
```bash
#Example: below is the port address for an IBC enabled smart contract on the Base (testnet) L2 (with proofs enabled)
polyibc.base-proofs-1.398461594ff79A12FC2FA6820Bf867b0d95DE955
```

:::note

Remember from the [IBC overview](../../learn/concepts/ibc/ibc.md) that ports facilitate module authentication? And that only a port owner (module or contract) can operate on all channels created with the port

:::

- (add keeper methods): specific to ibc-go, in the context where the IBC application is a dapp, this refers to the dapp methods that handle application logic
- add a route to the IBC router: this will be taken care of by the vIBC smart contract

:::tip Takeaway

As an xDapp developer, you will have to focus on the requirements above, implementing the `IBCModule` interface and defining packet and acknowledgment data structures.

:::

## The IBC callbacks

The [IBC app in Solidity template](https://github.com/open-ibc/ibc-app-solidity-template) repo contains folder of base contracts to inherit which have the IBC callbacks as virtual functions to override (or leave as is in the case of channel handshake callbacks).

Look at [CustomChanIbcApp.sol](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/contracts/base/CustomChanIbcApp.sol) as an example when creating custom channels.

You can inherit those contract when creating your application, like so:
```solidity
//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import './base/CustomChanIbcApp.sol';

contract XCounter is CustomChanIbcApp {
    ...

    constructor(IbcDispatcher _dispatcher) CustomChanIbcApp(_dispatcher) {}
```

Where you pass in the dispatcher address as constructor argument (with potentially additional custom ones).
Find it in the [network information overview](../supp-networks.md).

What do the interfaces in CustomIbcChanApp.sol represent and how to use them?

### IbcReceiverBase

Let's take a look at [`IbcReceiver.sol`](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/IbcReceiver.sol) to begin with.

The first thing to note is that there's an `IbcReceiverBase` contract that every IBC application will need to inherit from.

```solidity
contract IbcReceiverBase is Ownable {
    IbcDispatcher public dispatcher;

    /**
     * @dev Constructor function that takes an IbcDispatcher address and grants the IBC_ROLE to the Polymer IBC Dispatcher.
     * @param _dispatcher The address of the IbcDispatcher contract.
     */
    constructor(IbcDispatcher _dispatcher) Ownable() {
        dispatcher = _dispatcher;
    }

    /// This function is called for plain Ether transfers, i.e. for every call with empty calldata.
    // An empty function body is sufficient to receive packet fee refunds.
    receive() external payable {}

    /**
     * @dev Modifier to restrict access to only the IBC dispatcher.
     * Only the address with the IBC_ROLE can execute the function.
     * Should add this modifier to all IBC-related callback functions.
     */
    modifier onlyIbcDispatcher() {
        require(msg.sender == address(dispatcher), "only IBC dispatcher");
        _;
    }
}
```

The main thing the `IbcReceiverBase` establishes is registering the vIBC core dispatcher contract.

### IbcDispatcher

Arguably the most important among the vIBC core smart contracts, is the [`Dispatcher.sol`](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/Dispatcher.sol). The dispatcher is critical to manage (dispatch) IBC communication flow between applications on a virtual chain and Polymer (through the vIBC relayer).

Refer to the [vIBC concepts section](../../learn/concepts/vibc/overview.md) to learn more.

:::tip Find relevant contract addresses

Find the vIBC smart contracts on the chain you want to deploy your IBC enabled contracts. These are the only addresses you'll need (in addition to importing the interfaces). Find them [here](../supp-networks.md).

:::

When you send packets from your contracts, you can call into the `Dispatcher.sol`'s `sendPacket` method and the vIBC smart contracts will take care of the rest, much like ibc-go's core handler would do in a Cosmos SDK native IBC setup.

To communicate with the dispatcher contract in vIBC, an IBC application has to implement the `IbcDispatcher` interface, as defined in [IbcDispatcher.sol](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/IbcDispatcher.sol).

```solidity

/**
 * @title IbcPacketSender
 * @author Polymer Labs
 * @dev IBC packet sender interface.
 */
interface IbcPacketSender {
    function sendPacket(bytes32 channelId, bytes calldata payload, uint64 timeoutTimestamp) external;
}

/**
 * @title IbcDispatcher
 * @author Polymer Labs
 * @notice IBC dispatcher interface is the Polymer Core Smart Contract that implements the core IBC protocol.
 * @dev IBC-compatible contracts depend on this interface to actively participate in the IBC protocol. Other features are implemented as callback methods in the IbcReceiver interface.
 */
interface IbcDispatcher is IbcPacketSender {
    function portPrefix() external view returns (string memory);

    function openIbcChannel(
        IbcChannelReceiver portAddress,
        string calldata version,
        ChannelOrder ordering,
        bool feeEnabled,
        string[] calldata connectionHops,
        CounterParty calldata counterparty,
        Proof calldata proof
    ) external;

    function closeIbcChannel(bytes32 channelId) external;
}

```

It allows the application to call into the dispatcher to start channel creation by triggering the handshake or to start the packet lifecycle to send a packet.

An example from the [XCounter.sol](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/contracts/XCounter.sol) contract:
```solidity
    /**
     * @dev Sends a packet with the caller address over a specified channel.
     * @param channelId The ID of the channel (locally) to send the packet to.
     * @param timeoutSeconds The timeout in seconds (relative).
     */

    function sendPacket( bytes32 channelId, uint64 timeoutSeconds) external {
        // incrementing counter on source chain
        increment();

        // encoding the caller address to update counterMap on destination chain
        bytes memory payload = abi.encode(msg.sender);

        // setting the timeout timestamp at 10h from now
        uint64 timeoutTimestamp = uint64((block.timestamp + timeoutSeconds) * 1000000000);

        // calling the Dispatcher to send the packet
        dispatcher.sendPacket(channelId, payload, timeoutTimestamp);
    }
```

### IbcReceiver

As mentioned in the intro, an IBC application needs callbacks for the packet and channel lifecycle. These correspond to the `IbcPacketReceiver` and `IbcChannelReceiver`  interfaces that make up the `IbcReceiver` interface.
```solidity
/**
 * @title IbcPacketReceiver
 * @notice Packet handler interface must be implemented by a IBC-enabled contract.
 * @dev Packet handling callback methods are invoked by the IBC dispatcher.
 */
interface IbcPacketReceiver {
    function onRecvPacket(IbcPacket calldata packet) external returns (AckPacket memory ackPacket);

    function onAcknowledgementPacket(IbcPacket calldata packet, AckPacket calldata ack) external;

    function onTimeoutPacket(IbcPacket calldata packet) external;
}

```
and:
```solidity
/**
 * @title IbcChannelReceiver
 * @dev This interface must be implemented by IBC-enabled contracts that act as channel owners and process channel handshake callbacks.
 */
interface IbcChannelReceiver {
    function onOpenIbcChannel(
        string calldata version,
        ChannelOrder ordering,
        bool feeEnabled,
        string[] calldata connectionHops,
        string calldata counterpartyPortId,
        bytes32 counterpartyChannelId,
        string calldata counterpartyVersion
    ) external returns (string memory selectedVersion);

    function onConnectIbcChannel(bytes32 channelId, bytes32 counterpartyChannelId, string calldata counterpartyVersion)
        external;

    function onCloseIbcChannel(bytes32 channelId, string calldata counterpartyPortId, bytes32 counterpartyChannelId)
        external;
}

```

:::info Where's the remaining handshake steps?

For regulars of ibc-go, this may seem like the channel handshake is missing two callbacks. However, it is simply vIBC internals (`Dispatcher.sol`) picking the right choice of handshake step during both `openIbcChannel` and `connectIbcChannel` methods, as depending on where the handshake was triggered each side will only go through two of the steps.

:::

This interface (`IbcReceiver`) satisfies the The [ICS-26](https://github.com/cosmos/ibc/blob/main/spec/core/ics-026-routing-module/README.md) specification for an `IBCModule`.

:::tip Apply custom logic to these callbacks, specific to your application

One of the main jobs for you as xDapp developer when building IBC enabled applications is to implement these callbacks and provide them your custom logic.

You can both define custom logic for the packet callbacks and channel handshake callbacks, but for the latter you could limit it to the default version negotiation that is defined in `Mars.sol` for example.

:::

#### Additional struct definitions

Note that in a different file, [`Ibc.sol`](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/Ibc.sol), the following structs get defined, corresponding to the IBC specification:

```solidity
struct IbcEndpoint {
    string portId;
    bytes32 channelId;
}

/// In IBC each package must set at least one type of timeout:
/// the timestamp or the block height.
struct IbcTimeout {
    uint64 blockHeight;
    uint64 timestamp;
}

struct IbcPacket {
    /// identifies the channel and port on the sending chain.
    IbcEndpoint src;
    /// identifies the channel and port on the receiving chain.
    IbcEndpoint dest;
    /// The sequence number of the packet on the given channel
    uint64 sequence;
    bytes data;
    /// when packet times out, measured on remote chain
    IbcTimeout timeout;
}
```

Please refer to the [IBC overview in the docs](../../learn/concepts/ibc/ibc.md/#the-ibc-application-module-callbacks) for additional background info.

### `onRecvPacket` workflow

One thing to note from the above is that the `onRecvPacket` returns an acknowledgement, according to the [spec](https://github.com/cosmos/ibc/tree/main/spec/core/ics-026-routing-module#packet-relay).

Consider the `Mars.sol` example from earlier and how it implements the callback.

```solidity
function onRecvPacket(IbcPacket calldata packet) external returns (AckPacket memory ackPacket) {
        recvedPackets.push(packet);

        // here you'll typically decode the packet.data and do something with it

        return AckPacket(true, abi.encodePacked('ack_payload'));
    }

//where... (defined in `Ibc.sol`)
struct AckPacket {
    // success indidates the dApp-level logic. Even when a dApp fails to process a packet per its dApp logic, the
    // delivery of packet and ack packet are still considered successful.
    bool success;
    bytes data;
}
```

### Port binding

Having implemented these methods, once you've successfully set up a channel the contract (application) will be assigned a port (automatically) following the format: `IBC_PortID` =` portPrefix` + `IBC_ContractAddress `.

As an example, the port ID for a contract on optimism with contract address '0x6a2544b95f6C256250C83F1FAf1f32B3448b0E38' would be:
```typescript
const portID = "polyibc.optimism-proofs-1.6a2544b95f6C256250C83F1FAf1f32B3448b0E38"
```

## Example?

If you want an additional example other than the Mars.sol demo contract, you can follow along with the tutorials in the [tutorials section](../../quickstart/start.md).

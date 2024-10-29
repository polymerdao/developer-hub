---
sidebar_position: 5
sidebar_label: 'Private Message Flow'
---

# Creating your Private Channel (for private message flow)

Polymer follows networking topology similar to TCP, thus a channel is established through a session setup process, often called a handshake. It is a 4 step process and at every step of the handshake process, core IBC performs basic verification and logic, while making callbacks to the application where custom handshake logic can be performed.

![image (47)](https://github.com/user-attachments/assets/47b744c4-a4d1-4200-b16d-4e59e774d687)

While the [quickstart solidity template](https://docs.polymerlabs.org/docs/build/start/#custom-ibc-channel) takes care of the handshake process under the hood (it will take less than 5mins to go through the whole process), the follow section might help you understand some of the functions you are supposed to add in your smart contracts to allow them to proceed smoothly with the channel creation process.

:::tip

Custom channels are the most effective way to bring your application to production readiness. Custom channels are exclusively accessible by your contracts, as they rely on the core polymer contracts for authentication and security. Moreover, custom channels tend to be more gas efficient in the long run since they reduce the need for validation during packet handshakes. If you need any assistance during this process, feel free to reach out to the Polymer Labs team.

:::

Setting up a channel is done through calling ``channelOpenInit`` on the dispatcher contract and calling ``_depositOpenChannelFee``, which is available through inheriting from the `[FeeSender](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/implementation_templates/FeeSender.sol)` contract. 

**Example:** An application (e.g., [Mars demo contracts](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/examples/Mars.sol)) that initiates the channel creation process. 

```solidity
/**
     * @notice trigger a channelInit in the dispatcher with an additional call to deposit a fee into the FeeVault
     * @notice This should not be used if you are relaying your own txs, and triggerChannelInit should instead be
     * called.
     */
    function triggerChannelInitWithFee(
        string calldata version,
        ChannelOrder ordering,
        bool feeEnabled,
        string[] calldata connectionHops,
        string calldata counterpartyPortId
    ) external payable onlyOwner {
        IbcDispatcher _dispatcher = dispatcher; // cache for gas savings to avoid 2 SLOADS
        _dispatcher.channelOpenInit(version, ordering, feeEnabled, connectionHops, counterpartyPortId);
        _depositOpenChannelFee(_dispatcher, version, ordering, connectionHops, counterpartyPortId);
    }
```

Connection hops can be queried from the polymer registry. Each connection in the connection hop array encodes the given chain light client type you are using. The counterpartyPortId is simply a concatenation of the portPrefix of the destination chain (which can be queried from the polymer registry), and the address of the dapp you want to communicate with. 

**On the Receiver side**

Follow is the snippet of Channel Receiver interfaces from [**IbcReceiver.sol](https://github.com/open-ibc/vibc-core-smart-contracts/blob/b50844c6925d6780d110bbddb3c47d0797f57c7a/contracts/interfaces/IbcReceiver.sol#L29)** . 

Notice that the both source and destination contracts implement all the channel callbacks. Depending on which chain you initiate the channel handshake from, different functions will be called based on the flow is the diagram above. 

```solidity
/**
 * @title IbcChannelReceiver
 * @dev This interface must be implemented by IBC-enabled contracts that act as channel owners and process channel
 * handshake callbacks.
 */
interface IbcChannelReceiver {
    /**
     * @notice Handles the channel open try event (step 2 of the open channel handshake)
     * @dev Make sure to validate that the counterparty version is indeed one supported by the dapp; this callback
     * should
     * revert if not.
     * @param counterpartyVersion The version string provided by the counterparty
     * @return selectedVersion The selected version string
     */
    function onChanOpenTry(
        ChannelOrder order,
        string[] memory connectionHops,
        bytes32 channelId,
        string memory counterpartyPortIdentifier,
        bytes32 counterpartychannelId,
        string memory counterpartyVersion
    ) external returns (string memory selectedVersion);

    /**
     * @notice Handles the channel open acknowledgment event (step 3 of the open channel handshake)
     * @dev Make sure to validate channelId and counterpartyVersion
     * @param channelId The unique identifier of the channel
     * @param counterpartyVersion The version string provided by the counterparty
     */
    function onChanOpenAck(bytes32 channelId, bytes32 counterpartychannelId, string calldata counterpartyVersion)
        external;

    /**
     * @notice Handles the channel close confirmation event
     * @param channelId The unique identifier of the channel
     * @dev Make sure to validate channelId and counterpartyVersion
     * @param counterpartyPortId The unique identifier of the counterparty's port
     * @param counterpartyChannelId The unique identifier of the counterparty's channel
     */
    function onChanCloseConfirm(bytes32 channelId, string calldata counterpartyPortId, bytes32 counterpartyChannelId)
        external;

    /**
     * @notice Handles the channel open confirmation event (step 4 of the open channel handshake)
     * @dev Make sure to validate channelId and counterpartyVersion
     * @param channelId The unique identifier of the channel
     */
    function onChanOpenConfirm(bytes32 channelId) external;
}
```

Once you've successfully set up a channel the contract (application) will be assigned a port (automatically) following the format: `PortID` = `portPrefix` +`ContractAddress` .

As an example, the port ID for a contract on optimism with contract address '0x6a2544b95f6C256250C83F1FAf1f32B3448b0E38' would be:

```jsx
const portID = "polyibc.optimism.6a2544b95f6C256250C83F1FAf1f32B3448b0E38"
```

**Note:** You don't have to include the "0x" prefix in Port ID.

---
sidebar_position: 2
sidebar_label: 'For 7683 x TheCompact'
---

# ERC7683 x TheCompact

## Overview

Intents have evolved into a well-defined sub-class in interoperability, with contributions from multiple teams, aiming to standardize intent-settlement and facilitate fast deployments. This documentation serves as a contribution from Polymer Labs to support the broader goal of simplifying intent-settlement processes.

This example will cover various components from different smart contracts that interact with the intent settlement framework:

- **ERC7683 - Intent Standard**: ERC7683, developed by the Across team, defines the interface for generating orders, executing fill functions on destination chains, and data structures for solvers to resolve order instructions.
  - *Note*: ERC7683 is agnostic to the settlement system, allowing flexibility in choosing how the filler repayment is handled.
  - *Reference*: [ERC7683 Specification](https://www.erc7683.org/spec)
- **TheCompact**: TheCompact is a flexible "resource lock" contract that allows users to deposit assets, set conditions under which they can be transferred or withdrawn, and enforce withdrawal mechanisms. It provides interfaces for locking tokens and managing claims.
  - Supports various ways to claim tokens and track claims, ensuring that only authorized individuals can move tokens at specific times.
  - Inherits from **ERC6909**, enabling the issuance and tracking of multiple token IDs, where each deposit is treated as a separate token with its own ID.
  - *Note*: TheCompact does not define the intent interface; this decision is left to the Arbiter.
  - *Reference*: [TheCompact GitHub](https://github.com/Uniswap/the-compact/blob/5a5b649ec39ab8f0e84289e6333df5960d6ed65a/src/TheCompact.sol)
- **CrossL2Prover**: A contract developed by Polymer Protocol to validate cross-chain events without sending explicit messages. It stores the latest superRoot, which is the state of the Polymer rollup, enabling faster and more cost-effective Merkle proofs.
  - *Reference*: [CrossL2Prover Docs](https://docs.polymerlabs.org/docs/build/prove-api/prover-contract)
- **Arbiter**: The Arbiter contract is responsible for verifying and submitting settlement claims. It interacts with solvers to settle claims against TheCompact contract, acting as a bridge in the process.
  - *Reference*: [Arbiter Contract GitHub](https://github.com/polymerdao/arbiters/blob/bo/polyarbiter/src/PolymerArbiter.sol)
- **Tribunal**: Tribunal provides a framework where settlement logic can be trusted and governed by signatures (via EIP-712 typed data). It is designed to handle cross-chain swap settlements, taking into account gas-price dynamics on priority gas auction (PGA) chains like Ethereum.
  - *Reference*: [Tribunal GitHub](https://github.com/Uniswap/Tribunal/blob/main/src/Tribunal.sol#L321)

## E2E Overview

There are two primary methods for implementing Compact settlement:

1. **Tightly Coupled Approach**: In this approach, a registered Compact is tightly linked to its settlement system.
2. **Arbiter-Controlled Approach**: In this implementation, the Arbiter has full control over the settlement system.

The Polymer Labs implementation follows the Arbiter-controlled approach. This approach uses ERC-7683 to manage intents and demonstrates how it can be integrated with Compact settlement process.

**Key Features**:
- **Cross-L2 Execution Proofs**: Utilizes the `ICrossL2Prover` contract to verify events from other chains.
- **Finalizing Claims**: Uses `ITheCompactClaims` interface to finalize claims on the origin chain.
- **ERC-7683-Style Cross-Chain Order**: Orders and fills are structured using the `OnchainCrossChainOrder`, `Fill`, and related formats across chains.

For reference, see the [Polymer Arbiter Contract](https://github.com/polymerdao/arbiters/blob/bo/polyarbiter/src/PolymerArbiter.sol).

### Sequence of Events

- **On Origin**: A user calls `open(...)` to broadcast they want to do a cross-chain order. The arbiter logs `Open(...)`. The user’s funds might be locked in TheCompact or some mechanism on origin.
- **On Destination**: Another user or relayer calls `fill(...)`. The contract sends tokens to the recipient and logs `FillExecuted(orderId)`.
- **Cross-L2 Proof**: The user (or sponsor) obtains a proof of `FillExecuted(orderId)` from the destination chain’s logs (via some bridging mechanism).
- **Back on Origin**: They call `claim(...)` with that proof. The contract uses `CROSS_L2_PROVER` to confirm that fill actually happened. Then it calls `COMPACT.claim(...)` to release or finalize the locked funds on the origin side.

---

## The "Open" Function (Origin Side)

```solidity
function open(OnchainCrossChainOrder calldata order) external nonReentrant {
    // Build a ResolvedCrossChainOrder from the user + order
    ResolvedCrossChainOrder memory resolvedOrder = _createResolvedOrder(msg.sender, order);

    // Emit an event to signal we've opened the order
    emit Open(keccak256(order.orderData), resolvedOrder);
}
```

1. **User calls** `open(...)` with an `OnchainCrossChainOrder`.
2. The contract transforms it into a **ResolvedCrossChainOrder** via `_createResolvedOrder(...)`.
3. Emits an `Open(...)` event.

**Takeaway**: This marks the **origin** chain’s side of a cross-chain trade as “open” and publishes the order details.

Note following params are defined as per ERC7683: 

- **`orderDataType`**: EIP-712 typehash identifying the shape of `orderData`.
- **`orderData`**: Arbitrary data (tokens, amounts, bridging instructions, etc.).
- **`orderId`**: A unique identifier for this order (`keccak256` of core data).

#### `_createResolvedOrder` Helper

```solidity
function _createResolvedOrder(address user, OnchainCrossChainOrder memory order)
    internal
    view
    returns (ResolvedCrossChainOrder memory)
{
    // Checks if 'orderDataType' == ORDER_TYPE_HASH (so it’s the correct format)
    // Decodes 'orderData' into a concrete 'Order' struct
    // Builds an array of FillInstruction with info on where to fill (destination chain + data)
    // Returns a ResolvedCrossChainOrder
}
```

- Ensures the order matches the known type hash (`ORDER_TYPE_HASH`).
- Decodes the real data from `order.orderData`.
- Creates instructions for how the destination chain should fill the order (which chain, which “settler” contract, etc.).

---

## The "Fill" Function (Destination Side)

```solidity
function fill(
    bytes32 orderId,
    bytes calldata originData,
    bytes calldata // unused
) external override nonReentrant {
    // 1. Check if the order is already filled
    if (filledOrders[orderId]) revert OrderAlreadyFilled();

    // 2. Decode 'OnchainCrossChainOrder' from 'originData'
    OnchainCrossChainOrder memory order = abi.decode(originData, (OnchainCrossChainOrder));

    // 3. Decode the actual 'Order' struct
    Order memory concreteOrder = abi.decode(order.orderData, (Order));

    // 4. Verify it’s the right orderId
    if (keccak256(order.orderData) != orderId) revert InvalidOrderId();

    // 5. Mark the order as filled
    filledOrders[orderId] = true;

    // 6. Transfer ETH to the recipient on this chain
    (bool success,) = concreteOrder.recipient.call{value: concreteOrder.amount}("");
    if (!success) revert TransferFailed();

    // 7. Emit an event indicating the fill is done
    emit FillExecuted(orderId);
}
```

1. **Checks** if the order was already filled (`filledOrders[orderId]`).
2. **Decodes** the order data.
3. **Validates** the `orderData` matches the `orderId`.
4. **Marks** it as filled (so it can’t be repeated).
5. **Transfers** tokens to the `recipient` on the destination chain.
6. **Emits** `FillExecuted(orderId)` to record that the fill occurred.

**Takeaway**: On the **destination** chain, once “fill” is called, the user receives the tokens, and `FillExecuted` is logged for proof.

---

## The "Claim" Function with Proof (Back on Origin)

```solidity
function claim(
    bytes32 orderId,
    uint256 logIndex,
    bytes calldata proof,
    BasicClaim calldata claimData
) external nonReentrant {
    // 1. Use CROSS_L2_PROVER to check if 'FillExecuted(orderId)' occurred on destination chain
    ( , address emittingContract, bytes[] memory topics, ) = CROSS_L2_PROVER.validateEvent(logIndex, proof);

    // 2. Confirm event is from this contract's address (on the other chain)
    if (emittingContract != address(this)) revert InvalidEventSender();

    // 3. Build expected topics [FillExecuted.selector, orderId]
    bytes[] memory expectedTopics = new bytes[](2);
    expectedTopics[0] = bytes.concat(FillExecuted.selector);
    expectedTopics[1] = bytes.concat(orderId);

    // 4. Check the event actually matches (the correct order was filled)
    if (!Bytes.equal(abi.encode(topics), abi.encode(expectedTopics))) {
        revert InvalidCounterpartyEvent();
    }

    // 5. If valid, finalize the claim in TheCompact
    COMPACT.claim(claimData);
}
```

1. **Verifies** via `CROSS_L2_PROVER` that a `FillExecuted(orderId)` event truly occurred on the **destination** chain’s logs.
2. **Validates** the event’s `topics` to ensure it’s specifically the event with the right `orderId`.
3. **Calls** `COMPACT.claim(claimData)` to finalize the claim in TheCompact on the **origin** chain.

**Takeaway**: This is how the origin chain learns that the order was actually filled on the destination chain. Once proven, the filler can “claim” in TheCompact.

---

## Challenges in Messaging Systems

Messaging protocols tightly couple source and destination contracts with their bridging contract, creating challenges in scenarios with multiple rollups, where **Compact** is deployed, which spans across several chains.

### Key Challenges

- **Arbiter Deployment Complexity**: Deploying arbiters requires connecting contracts across multiple chains for each chain route point-to-point, creating a multi-step, complex flow that is difficult to manage and then settle with.
- **Complex Verification**: Using DVNs, Plugs, or ISM for verification can complicate contracts further, disrupting the end-to-end flow whenever a developer makes changes.
- **High Transaction Costs**: Cross-chain messaging involves multiple transactions per chain, with additional relaying costs - often costing 500k gas per transaction, making frequent operations inefficient.
- **Adding New Chains**: Integrating new chains requires reconfiguring all instances, leading to time-consuming and error-prone processes that hinder scalability.


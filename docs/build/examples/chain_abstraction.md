---
sidebar_position: 1
sidebar_label: 'For Chain Abstraction'
---


# Chain Abstraction Protocols 

Chain Abstraction protocols are redefining interoperability by combining resource locks and account abstraction (ERC4337). These enable users to lock funds into wallets on single or multi-chains and gain instant spendable balance across rollups. This seamless spending is powered by a network of solvers who front tokens for User Operations.

The critical element here is repayment. Solvers are only repaid if the user operation succeeds, and this is precisely where the Prove API steps in. It provides developers with execution proofs to validate user operations and facilitate repayments.

**Openfort** is one of the first teams leveraging the Prove API, pushing the boundaries of chain abstraction. Openfort extends ERC4337 by incorporating an invoice manager and settlement system, enabling cross-chain functionality with Polymer. (See the [Openfort Chain Abstraction repository](https://github.com/openfort-xyz/openfort-chain-abstraction)).

<div style={{position: 'relative', paddingBottom: '59.31830676195712%', height: 0}}><iframe src="https://github.com/user-attachments/assets/34cf828f-27e2-4f61-b86a-626f46cf0892" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></iframe></div>

<br/>


### End-to-End Overview

Applications using Openfort’s WalletSDK can abstract their application instances deployed across various chains and allow users to instantly interact with their application. 
![Chain Abstraction Protocols Image](https://github.com/user-attachments/assets/5ef4d54a-4613-44c7-bac4-8292e343b446)

**Steps**

1. **User Interaction**: When a user interacts with the application, a UserOp is created containing details about the tokens the user will pay with and the sponsor token chain. This data is sent to an ERC4337-compatible Paymaster as `paymasterAndData`.
2. **Invoice Creation**: Once the user request is fronted by a solver or the application’s excess liquidity, a `postOp` generates and emits an `invoiceID`. This globally unique identifier secures repayments.
3. **Proof Request**: Openfort’s backend requests a proof for the `invoiceID` event from the Prove API.
4. **Repayment**: Using the execution proof, the backend calls the repay function to settle the `invoiceID` and repay the sponsor tokens.

<br/>

#### Emitting InvoiceID in Post Operations

The following code demonstrates how an `invoiceID` is emitted during a `postOp`:

```jsx
function _postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost, uint256 actualUserOpFeePerGas)
        internal
        virtual
        override
    {
        bytes32 invoiceId = bytes32(context[:32]);
        bytes calldata sponsorTokenData = context[32:];

        (uint8 sponsorTokenLength, SponsorToken[] memory sponsorTokens) = parseSponsorTokenData(sponsorTokenData);
        for (uint8 i = 0; i < sponsorTokenLength; i++) {
            SponsorToken memory sponsorToken = sponsorTokens[i];
            IERC20(sponsorToken.token).approve(sponsorToken.spender, 0);
        }
        // TODO: Batch Proving Optimistation -> write in settlement contract on `opSucceeded`
        if (mode == PostOpMode.opSucceeded) {
            emit InvoiceCreated(invoiceId);
        }
```

In future iterations, we plan to push all postOps to a settlement contract, where multiple invoices will be stored and batch-emitted to pack multiple invoiceID events under a single receipt.

<br/>

#### Settling Repayment on the Vault chain

The following code illustrates how repayment is processed on the vault chain, which calls another `verifyInvoice` to validate the `InvoiceID` against the proof Polymer provided. 

```jsx
/// @inheritdoc IInvoiceManager
    function repay(bytes32 invoiceId, InvoiceWithRepayTokens calldata invoice, bytes calldata proof)
        external
        override
        nonReentrant
    {
        IPaymasterVerifier paymasterVerifier = cabPaymasters[invoice.account].paymasterVerifier;
        require(address(paymasterVerifier) != address(0), "InvoiceManager: paymaster verifier not registered");
        require(!isInvoiceRepaid[invoiceId], "InvoiceManager: invoice already repaid");

        bool isVerified = paymasterVerifier.verifyInvoice(invoiceId, invoice, proof);

        if (!isVerified) {
            revert("InvoiceManager: invalid invoice");
        }
        (IVault[] memory vaults, uint256[] memory amounts) = _getRepayToken(invoice);

        isInvoiceRepaid[invoiceId] = true;
        vaultManager.withdrawSponsorToken(invoice.account, vaults, amounts, invoice.paymaster);

        emit InvoiceRepaid(invoiceId, invoice.account, invoice.paymaster);
    }
```

The invoiceID, as defined by the ERC4337 spec, encapsulates the UserOp. It is essentially a hash derived from the account, payment (contract that emitted the invoice), sponsorChainID, and TokenInfo.

```jsx
/// @inheritdoc IInvoiceManager
    function getInvoiceId(
        address account,
        address paymaster,
        uint256 nonce,
        uint256 sponsorChainId,
        bytes calldata repayTokenInfos
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(account, paymaster, nonce, sponsorChainId, repayTokenInfos));
    }
```

Before calling `validateLog` to `CrossL2Prover`, the invoice manager verifies the invoice by calling getInvoiceID.

```jsx
function verifyInvoice(
        bytes32 _invoiceId,
        IInvoiceManager.InvoiceWithRepayTokens calldata _invoice,
        bytes calldata _proof
    ) external virtual override returns (bool) {
        bytes32 invoiceId = invoiceManager.getInvoiceId(
            _invoice.account,
            _invoice.paymaster,
            _invoice.nonce,
            _invoice.sponsorChainId,
            _encodeRepayToken(_invoice.repayTokenInfos)
        );

        if (invoiceId != _invoiceId) return false;

        (uint256 logIndex, bytes memory proof) = abi.decode(_proof, (uint256, bytes));
        (,, bytes[] memory topics,) = crossL2Prover.validateEvent(logIndex, proof);
        bytes[] memory expectedTopics = new bytes[](2);
        expectedTopics[0] = abi.encode(InvoiceCreated.selector);
        expectedTopics[1] = abi.encode(invoiceId);

        if (!LibBytes.eq(abi.encode(topics), abi.encode(expectedTopics))) {
            return false;
        }
        emit InvoiceVerified(invoiceId);
        return true;
    }
```

The key advantage here is that Polymer validates the entire receipt and every log within it, providing the application with a complete context of the event, including:

- The emitting chain
- The emitting contract (in this case, the paymaster)
- All related topics and unindexed data, including the invoiceID hash from another chain

Since the context is also maintained by the Invoice Manager and the invoiceID, it ensures end-to-end mapping of the UserOp. In the future, this will enable any solver to request settlement without requiring the Openfort backend to perform transactions.

Additionally, the Invoice Manager maintains a record of already paid invoiceIDs, effectively preventing double-spend attacks.

<br/>

#### Compared to Messaging

This chain abstraction example demonstrates a fairly complex use case, with different contracts handling various aspects of the overall protocol. Adding a messaging protocol to this intricate design significantly increases developer overhead:
- Developers must modify all contracts to interface with bridge contracts for sending messages.
- Messaging systems using DVNs, Plug, or ISM for verification can complicate contracts further, disrupting the end-to-end flow whenever a developer makes changes.
- These factors collectively make debugging the application considerably more challenging.
- Sending a cross-chain message for every UserOp—requiring two transactions on each chain and additional costs for relaying infrastructure—gets very expensive, especially with no clear batching strategy in place.

You can check out complete demo - [here](https://www.youtube.com/watch?v=L0Jmdw_XQX0).

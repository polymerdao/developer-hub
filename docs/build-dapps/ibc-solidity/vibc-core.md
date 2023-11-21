---
sidebar_position: 1
sidebar_label: 'vIBC core contracts'
---

# The vIBC core smart contracts


One of the differentiating features of the Polymer chain, is its ability to enable IBC for chains (rollups) that don't have a native implementation and/or compatibility. We call these chains _virtual chains_ in the language of [vIBC](../../concepts/vibc.md).

To ensure that these chains have access to the IBC transport layer, Polymer enables to run the IBC transport layer on their behalf.

## Theory

From the [concepts section on vIBC](../../concepts/vibc.md), we get the following takeaway:



> vIBC is essentially the answer to the question how to adapt IBC when it is modular, i.e. the transport layer lives on another chain than the applications using it.
Another way look at it, is to consider it an extension of the IBC handler/router submodules to facilitate IBC communication asynchronously across chains.

![vIBC overview](../../../static/img/ibc/virtual-ibc.png)

For the xDapp developer this implies that their application modules (smart contracts) that implement the [IBC application module interface defined by ICS-26](https://github.com/cosmos/ibc/tree/main/spec/core/ics-026-routing-module#module-callback-interface) will not exchange information with a core IBC implementation _on the chain it's hosted on_, but **with Polymer's IBC implementation**.

Instead of having the IBC handler (and routing) module handle communication between IBC application modules and the IBC core all on the same chain, that functionality is extended by virtual IBC to allow for outsourcing IBC core functionality.

:::note 

The IBC handler (and routing) in virtual IBC consists of:

1. the vIBC core smart contracts _on the virtual chain_
2. the _off-chain_ vIBC relayer that relays communication between virtual chain and Polymer (or any other IBC hub implmementing virtual IBC protocol)
3. a `vIBC` module _on Polymer_ that wraps around the core IBC module on it.

:::

Let's take a closer look at the vIBC core smart contracts.

## Practical

When developing IBC application modules or smart contracts on a virtual chain (e.g. Ethereum), you'll need the following:

- access to the interfaces defined by the vIBC core smart contracts (e.g. [`IbcReceiver` interface](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/IbcReceiver.sol) for IBC application modules)
- the address of the _Dispatcher_ vIBC core smart contract on the virtual chain

:::note vIBC core contracts source code
The vIBC core smart contracts can be found in [this GitHub repo](https://github.com/open-ibc/vibc-core-smart-contracts) or be imported into your project as [this npm package](https://www.npmjs.com/package/@open-ibc/vibc-core-smart-contracts?activeTab=code).
:::

Include the vIBC core smart contracts to your project by running:

```bash
npm i @open-ibc/vibc-core-smart-contracts
```

You can then import for example the `IbcReceiver` interface to extend your IBC enabled contract, like so:

```solidity
...
import '$ROOT_DIR/node_modules/@open-ibc/vibc-core-smart-contracts/contracts/IbcReceiver.sol'
...
// have your application contract implement the interface
contract MyIbcContract is IbcReceiver {
    ...
}
```

Continue on to the [next section](ibc-solidity.md) to see how to implement the interfaces to write IBC enabled smart contracts.
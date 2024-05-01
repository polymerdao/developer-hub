---
sidebar_position: 1
sidebar_label: 'vIBC core contracts'
---

# The vIBC core smart contracts


One of the differentiating features of the Polymer chain, is its ability to enable IBC for chains (rollups) that don't have a native implementation and/or compatibility. We call these chains _virtual chains_ in the language of [vIBC](../../learn/concepts/vibc/overview.md).

To ensure that these chains have access to the IBC transport layer, Polymer effectively runs the IBC transport layer on their behalf.

## Theory

From the [concepts section on vIBC](../../learn/concepts/vibc/components.md), we get the following takeaway:


> vIBC is essentially the answer to the question how to adapt IBC when it is modular, i.e. the transport layer lives on another chain than the applications using it.
Another way look at it, is to consider it an extension of the IBC handler/router submodules to facilitate IBC communication asynchronously across chains.

![vIBC overview](../../../static/img/ibc/virtual-ibc.png)

For the cross-chain Dapp developer this implies that their application modules (smart contracts) that implement the [IBC application module interface defined by ICS-26](https://github.com/cosmos/ibc/tree/main/spec/core/ics-026-routing-module#module-callback-interface) will not exchange information with a core IBC implementation _on the chain it's hosted on_, but **with Polymer's IBC implementation**.

Instead of having the IBC handler (and routing) module handle communication between IBC application modules and the IBC core all on the same chain, that functionality is extended by virtual IBC to allow for outsourcing IBC core functionality.

:::note 

The IBC handler (and routing) in virtual IBC consists of:

1. the vIBC core smart contracts _on the virtual chain_
2. the _off-chain_ vIBC relayer that relays communication between virtual chain and Polymer (or any other IBC hub implementing virtual IBC protocol)
3. a `vIBC` module _on Polymer_ that wraps around the core IBC module (ibc-go) also on Polymer.

:::

Let's take a closer look at the vIBC core smart contracts.

## Implementation

When developing IBC application modules or smart contracts on a virtual chain (e.g. Ethereum), you'll need the following:

- access to the interfaces defined by the vIBC core smart contracts (e.g. [`IbcReceiver` interface](https://github.com/open-ibc/vibc-core-smart-contracts/blob/main/contracts/interfaces/IbcReceiver.sol) for IBC application modules)
- the address of the _Dispatcher_ vIBC core smart contract on the virtual chain

:::note vIBC core contracts source code
The vIBC core smart contracts can be found in [this GitHub repo](https://github.com/open-ibc/vibc-core-smart-contracts).
:::

Include the vIBC core smart contracts to your project by running the following command into your project:

```bash
git submodule add https://github.com/open-ibc/vibc-core-smart-contracts.git [optional-destination-path]
```

Alternatively, consider using [Foundry](https://book.getfoundry.sh/getting-started/installation) to manage the dependencies:
```bash
forge install open-ibc/vibc-core-smart-contracts
```

:::tip Use IBC app template

Just adding the vibc-core-smart-contracts as a dependency to your project is possible, but we have a template repository named [ibc-app-solidity-template](https://github.com/open-ibc/ibc-app-solidity-template) which abstracts away a lot of the complexity and is a great place to start!

:::

### A high-level overview of the vIBC contracts

In the `/contracts` folder for the vIBC core smart contracts repo you'll find the following folders (alphabetical order):

1. `/base`: This folder contains base contracts applications can inherit from
2. `/core`: This folder contains the **core logic for vIBC core**, we look at it in more detail below
3. `/examples`: Fairly self-explanatory, this folder contains some example implementations
4. `/interfaces`: Contains the interfaces defined, such as the ICS-26 interface IBC apps need to implement
5. `/libs`: Contains libraries with shared functionality and definitions
6. `/utils`: This folder contains some utils, including dummy light client contracts for the sim client.

### Core logic

The `/core` folder contains the most important contracts for vIBC.

The **Dispatcher contract** implements a dispatcher that IBC applications call when they want to interact over IBC. The dispatcher will then emit IBC compatible events picked up by a vIBC relayer who will sumbit an IBC message to Polymer relating to the event along with a kind of proof as defined by the proof spec of the chosen IBC client (chosen by the dApp developer). Alternatively events from Polymer or other IBC compatible chains destined for the virtual chain, are relayed by the vIBC relayer by calling into the dispatcher as well, which in turn will call the application callbacks as defined by the IBC packet lifecycle.

The **OpLightClient** and **OpProofVerifier** contracts take on the functionality of IBC client: keeping track of the _ConsensusState_ (a slight misnomer for the sake of IBC spec compatibility, given that for OP stack rollups the state is derived from L1 state and technically has no consensus), and handling updates to the state as well as verifying packet commitments against the state.

The **UniversalChannelHandler contract** is an IBC middleware that allows applications that wish to send IBC packets without establishing their own channel, to define a middleware stack where the UniversalChannelHandler owns the port for the universal IBC channel and allows to wrap the application's packet data with some additonal information into an IBC packet which is sent to the destinaton and then unwrapped by the counterparty UniversalChannelHandler before forwarding to the destination application. Read more in [the dedicated section](./universal-channel.md).

### Import required logic or interfaces

You can then import for example the `IbcReceiver` and `IbcReceiverBase` interface to extend your IBC enabled contract, like so:

```solidity
...
// make sure to define a remapping to find @open-ibc/vibc-core-smart-contracts from the dependency /lib folder
import { IbcReceiver, IbcReceiverBase } from '@open-ibc/vibc-core-smart-contracts/contracts/interfaces/IbcReceiver.sol'
...
// have your application contract implement the interface
contract MyIbcContract is IbcReceiver, IbcReceiverBase {
    ...
}
```

Continue on to the [next section](ibc-solidity.md) to see how to implement the interfaces to write IBC enabled smart contracts.

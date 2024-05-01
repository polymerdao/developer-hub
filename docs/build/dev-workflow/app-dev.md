---
sidebar_position: 2
sidebar_label: 'App developer workflow'
---

# Application developer workflow

Application developers are smart contract developers that build business logic requiring interaction with a remote chain or rollup. For application or _dApp_ developers, being able to have a smooth developer journey along the development process is critical to deploying dApps safely and effectively. Let's review the process you'll follow when building cross-chain applications that leverage Polymer and IBC.

:::note Application-specific rollups

The notion of application-specific chains or rollups, originated in Cosmos, has been gaining more mindshare among Ethereum rollups recently. This means that the line between application and chain/rollup developer is becoming more blurred.
However, in the context of this discussion an application developer is someone developing cross-chain smart contracts (initially scoped to EVM compatible rollups).

:::

## Prerequisites

Before starting to build cross-chain dApps through Polymer, there's a couple of things to consider:

1. Do you have _an application that requires cross-chain functionality_?
2. Are the networks you're targeting [supported by Polymer](../supp-networks.mdx)? (if not, reach out to us)

### Ideation

When going through the documentation, it's likely that you already have a cross-chain application in mind. Cross-chain applications can be split up into 2 broad categories:

- An originally single chain app that is refactored into a cross-chain one.
- A _natively cross-chain_ application from scratch.

As the need for scalability incentivizes more and more rollups or applications to be responsible for their own execution environments, application composability will increasingly appear as cross-chain interactions.

### Polymer support

Polymer enables Ethereum rollups to use [IBC](../../learn/concepts/ibc/ibc.md) through the virtual IBC protocol. This implies deploying a set of [vIBC core smart contracts](../ibc-solidity/vibc-core.md) on the target chain and providing relayer support between that rollup and Polymer.

Polymer ensures support for a number of networks, to be found in the [supported networks page](../supp-networks.mdx).

However, the **vIBC protocol allows for permissionless integration** so even if the rollup you're interested in is not on the supported networks list, rollup integration is still possible. Refer to the documentation on [integration](../integration/integration.md) for more information.

## Develop IBC enabled dApps

When you've confirmed there is support to use Polymer with your target rollups, you can go ahead to develop or refactor your application to integrate with Polymer.

This comes down to:

1. Go to the [ibc-app-solidity-template repo](https://github.com/open-ibc/ibc-app-solidity-template) and use it as a template (right top corner on GitHub) to start with. It sets up a template project with Hardhat and Foundry compatibility, includes the [vIBC core smart contracts](htpps://github.com/open-ibc/vibc-core-smart-contracts) and [Polymer chain registry](https://github.com/polymerdao/polymer-registry) as dependency in your project and comes with a simple quickstart project as well as some basic scripts to help kickstart your IBC development in Solidity.

2. Decide whether you want to own your own private IBC channel or if you want to use the [Universal Channel](../ibc-solidity/universal-channel.md) that aggregates multiple applications sending packets over it. This decision will come down to your preferences: a custom channel ensures you own the channel and have more control over rate limiting, authentication, channel versioning etc. It requires the application to set up a channel handshake however, which may be undesirable.

3. Develop you own custom contracts by implementing the [required interfaces](https://github.com/cosmos/ibc/tree/main/spec/core/ics-026-routing-module#module-callback-interface) to your contracts to enable IBC, as explained in the [build IBC dApps](../ibc-solidity/ibc-solidity.md) section.

:::tip Guiding principle

We strive to make building cross-chain with Polymer as seamless as possible, meaning there's little overhead to your development workflow and still being able to use the developer tooling and environments that are familiar to you (e.g. [Hardhat](https://hardhat.org/), [Foundry](https://book.getfoundry.sh/), [Tenderly](https://github.com/Tenderly/tenderly-cli), ...).

:::

## Deploying to and testing on testnet

Once your contracts have been updated with IBC related logic and have been tested locally, you can move on to deploying them to testnet and connect them to Polymer's dispatcher or universal channel handler contracts on chain.

The most straightforward way to get started is to use the [ibc-app-solidity-template repo](https://github.com/open-ibc/ibc-app-solidity-template). It has all the dependencies and default scripts required to deploy and send packets in no time. 

:::info Add chain info in Hardhat or Foundry config and off you go 🚀

Check out the [ibc-app-solidity-template repo](https://github.com/open-ibc/ibc-app-solidity-template) documentation or default Hardhat config with OP Sepolia and Base Sepolia added to find out what information to add to the config file of your development environment of choice. After that, deploying your contracts and setting up IBC channels or sending packets between the configured chains should be seamless.

:::

### How to connect your contract with Polymer dispatcher?

The IBC app in Solidity template includes some base contracts for applications you can inherit from. Then it simply comes down to adding [the dispatcher](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/contracts/XCounter.sol#L13) or [universal channel handler address](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/contracts/XCounterUC.sol#L12) to the constructor of your applications's contract.

:::note Not using IBC solidity app template?

Although recommended to get started, it's not required to use _ibc-app-solidity-template_. In that case you'll have to manually add the dependencies to your project and look at the example contracts in the [vIBC core smart contracts repo](htpps://github.com/open-ibc/vibc-core-smart-contracts) to implement the required interfaces.

:::

### Testing IBC behaviour

Currently, local dev environments to test full E2E packet (or channel creation) flow are limited so we recommend the following testing strategy:

1. Add IBC packet lifecylce and/or channel lifecycle methods and add unit tests (e.g. in Hardhat/Foundry) for the functions in isolation.
2. Deploy and test on testnet using the _sim client_. This client simply forwards messages without waiting for proofs to be available. This improves latency and makes sure that your application logic is correct before testing full (v)IBC flows with the client you'll use in production.
3. When the logic works with sim client, pick the client you'll use in production and perform some extra testing. 

:::danger Sim client is fast, but less secure!

In the table below you'll find for each testnet a link to the Dispatcher and Universal channel middleware contracts for different kinds of clients. 

- The _sim client_ is meant to be used for prototyping and iterative development. It is faster, but **less secure**
- The _proof-enabled_ client goes through the channel or packet lifecycles with proofs provided by the relayer. This is slower, but more secure and representative of mainnet circumstances.

Be sure to move on to proof-enabled clients when your application logic looks sound.

:::

## Deploying to mainnet

:::caution Mainnet not yet available

We'll update this section when mainnet becomes available, although the principles will not change much compared to testnet. 

:::

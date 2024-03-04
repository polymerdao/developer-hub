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
2. Are the networks you're targeting [supported by Polymer](../supp-networks.md)? (if not, reach out to us)

### Ideation

When going through the documentation, it's likely that you already have a cross-chain application in mind. Cross-chain applications can be split up into 2 broad categories:

- An orignally single chain app that is refactored into a cross-chain one.
- A _natively cross-chain_ application from scratch.

As the need for scalability incentivizes more and more rollups or applications to be responsible for their own execution environments, application composability will increasingly appear as cross-chain interactions.

### Polymer support

Polymer enables Ethereum rollups to use [IBC](../learn/concepts/ibc/ibc.md) through the virtual IBC protcol. This implies deploying a set of [vIBC core smart contracts](./ibc-solidity/vibc-core.md) on the target chain and providing relayer support between that rollup and Polymer.

Polymer ensures support for a number of networks, to be found in the [supported networks page](./supp-networks.md).

However, the vIBC protocol allows for permissionless integration so even if the rollup you're interested in is not on the supported networks list, rollup integration is still possible. Refer to the documentation on [integration](./integration.md) for more information.

## Develop IBC enabled dApps

When you've confirmed there is support to use Polymer with your target rollups, you can go ahead to develop or refactor your application to integrate with Polymer.

This comes down to:

1. Go to the [ibc-app-solidity-template repo](https://github.com/open-ibc/ibc-app-solidity-template) and use it as a template (right top corner on GitHub) to start with. It sets up a template project with Hardhat and Foundry compatibility, includes the [vIBC core smart contracts](htpps://github.com/open-ibc/vibc-core-smart-contracts) as dependency in your project and comes with a simple quickstart project as well as some basic scripts to help IBC development in Solidity.

2. Develop you own custom contracts by implementing the [required interfaces](https://github.com/cosmos/ibc/tree/main/spec/core/ics-026-routing-module#module-callback-interface) to your contracts to enable IBC, as explained in the [build IBC dApps](./ibc-solidity/ibc-solidity.md) section.

:::tip Guiding principle

We strive to make building cross-chain with Polymer as seamless as possible, meaning there's little overhead to your development workflow and still being able to use the developer tooling and environments that are familiar to you (e.g. [Hardhat](https://hardhat.org/), [Foundry](https://book.getfoundry.sh/), [Tenderly](https://github.com/Tenderly/tenderly-cli), ...).

:::

## Deploying to and testing on testnet

Once your contracts have been updated with IBC related logic and have been tested locally, you can move on to deploying them to testnet and connect them to Polymer's dispatcher or universal channel handler contracts on chain.

Find the dispatcher and universal channel handler contract addresses in the [supported networks page](./supp-networks.md).

:::info How to connect your contract with Polymer dispatcher?

The IBC app in Solidity template includes some base contracts for applications you can inherit from. Then it simply comes down to adding [the dispatcher](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/contracts/XCounter.sol#L13) or [universal channel handler address](https://github.com/open-ibc/ibc-app-solidity-template/blob/main/contracts/XCounterUC.sol#L12) to the constructor of your applications's contract.

:::

## Deploying to mainnet

:::caution Mainnet not yet available

We'll update this section when mainnet becomes available, although the principles will not change much compared to testnet. 

:::

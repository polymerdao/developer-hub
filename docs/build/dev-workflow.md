---
sidebar_position: 1
sidebar_label: 'Developer workflow'
---

# Developer workflow

:::info Who's this section for?

A number of different actors might be interested in interacting with Polymer, and different sections of the documentation apply to each.

- [x] cross-chain application (xDapp) developers: refer to [building IBC dApps docs](../category/build-ibc-dapps/)
- [x] chain/rollup core developers: refer to [rollup integration docs](./integration.md)
- [ ] relayer operators: docs to follow
- [ ] other services: docs to follow
:::

For dApp developers, being able to have a smooth developer journey along the development process is critical to deploying dApps safely and effectively.

## Prerequisites

Before starting to build cross-chain dApps through Polymer, there's a couple of things to consider:

1. Do you have _an application that requires cross-chain functionality_?
2. Are the networks you're targeting supported by Polymer?

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

1. Include the [vIBC core smart contracts](./ibc-solidity/vibc-core.md) into your project. Either as an [npm](https://www.npmjs.com/package/@open-ibc/vibc-core-smart-contracts) dependency, or add [the source code](https://github.com/open-ibc/vibc-core-smart-contracts) to your project.

2. Implement the [required interfaces](https://github.com/cosmos/ibc/tree/main/spec/core/ics-026-routing-module#module-callback-interface) to your contracts to enable IBC, as explained in the [build IBC dApps](./ibc-solidity/ibc-solidity.md) section.

:::tip Guiding principle

We strive to make building cross-chain with Polymer as seamless as possible, meaning there's little overhead to your development workflow and still being able to use the developer tooling and environments that are familiar to you (e.g. [Hardhat](https://hardhat.org/), [Foundry](https://book.getfoundry.sh/), [Tenderly](https://github.com/Tenderly/tenderly-cli), ...).

:::

## Deploying to and testing on testnet

Once your contracts have been updated with IBC related logic and have been tested locally, you can move on to deploying them to testnet and connect them to Polymer's dispatcher contract on chain.

Find the dispatcher contract address in the [supported networks page](./supp-networks.md).

:::info How to connect your contract with Polymer dispatcher?

If you have the address for the dispatcher contract, how do you _connect_ it? There's multiple patterns you could follow when writing the contracts:

- store the dispatcher address in the contract's storage (it should be long lasting) along with a setter to update

- pass it as an argument when calling the dispatcher (e.g. to create a channel or send a packet)

For more details, check out the [tutorials](../category/quickstart/).

:::

## Deploying to mainnet

:::caution Mainnet not yet available

We'll update this section when mainnet becomes available, although the principles will not change much compared to testnet. 

:::

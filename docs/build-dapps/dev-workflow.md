---
sidebar_position: 1
sidebar_label: 'Developer workflow'
---

# Your dev workflow

:::info Who's this section for?

A number of different actors might be interested in interacting with Polymer, and different sections of the documentation apply to each.

- [x] cross-chain application (xDapp) developers: you're in the right place
- [ ] chain core developers: docs to follow
- [ ] relayer operators: docs to follow
- [ ] other services: docs to follow
:::

## From idea to mainnet

For xDapp developers, being able to have a smooth developer journey along the development process is critical to be able to deploy safely and effectively.

We highlight here a recommended workflow on this journey:

- **Ideation**:
  - Option 1: refactor an existing application/contract that used to be single chain, into a cross-chain one.
  - Option 2: develop a _natively cross-chain_ application from scratch.
- **Smart contract development**:
  - Pick one or more [supported chain(s)](#supported-networks) to develop (part of) your application on.
  - Develop your application/contracts using a developer environment of your choice ([Hardhat](https://hardhat.org/), [Foundry](https://book.getfoundry.sh/), ...).
  - Make sure the IBC enabled contract(s) in your application satisfy the [IBC application module interface defined by ICS-26](https://github.com/cosmos/ibc/tree/main/spec/core/ics-026-routing-module#module-callback-interface).

  <!-- TODO: update when it's clear what the recommended workflow is, i.e. what local testing options are there? -->
- **Local devnet IBC packet testing with IBC SDK**:
  - To quickly test and iterate on development of IBC enabled contracts, you can use [IBC SDK](https://github.com/open-ibc/ibc-sdk) which provides automated tooling to rapidly spin up an environment to test IBC channel handshake and packet lifecycle behaviour. Read the [documentation](https://developers.openibc.com) to find out more.
  - Starting from snapshots with existing chain state is currently on still in the works, so for testing entire application flow move on to next step.
- **Persistent testnet**:
  - To test complete e2e application flows that fully leverage the power of IBC and _interchain composability_, you'll want to move on to using persistent testnets for the chains you're building on top of
  - Find the necessary information to connect your application with Polymer as middle hop. See [the dedicated documentation](TODO) on this.
- **Deploying to mainnet**
  - If all the above steps worked out, you can deploy to mainnet and offer your product!

Read on find out what networks we support, where to find the required contract addresses, how to write IBC enabled smart contracts and how to connect them to Polymer's vIBC core contracts. 

You can also learn by doing by following one of our [quickstart tutorials](./../category/quickstart-tutorials).
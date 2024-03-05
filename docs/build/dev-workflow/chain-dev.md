---
sidebar_position: 3
sidebar_label: 'Chain developer workflow'
---

# Chain or framework developer workflow

Chain or framework core developers are developers that do not directly build applications that use IBC but they ensure that their chain or rollup have gone through the required integration steps to establish IBC connection(s) between their rollup and the Polymer Hub. Through the Polymer Hub, they then have connection to all of the IBC network.

The main difference between chain/rollup and framework developers, is that in the case of a framework every chain or rollup deployed with that framework would include a Polymer, vIBC integration by virtue of setting up some automation. Whereas for a single chain/rollup, this might be a singular deployment process.

:::tip Application-specific chains

Somewhat of a combination happens when a chain is an application specific chain or rollup. In that case application and chain core developers might be overlapping profiles.

:::

## What is required for integration?

:::caution 🚧 Not fully supported yet

Permissionless integration of vIBC, permissionlessly running relayers and connecting to Polymer Hub for any (OP Stack and more in the future) rollup is the ultimate goal and one of the unique selling points of Polymer.

Polymer will have a phased launch however, first focusing on enabling application developers. Increased support for integration and running relayers will follow soon.

:::

1. Deploying the [vIBC core smart contracts](https://github.com/open-ibc/vibc-core-smart-contracts). Find the [script to help deployment](https://github.com/open-ibc/vibc-core-smart-contracts/tree/main/script) of the contracts and make sure to log the important contract addresses (dispatcher, universal channel handler etc.).

2. Run a relayer between Polymer and your rollup. **NOTE**: a runbook will follow soon.

_Further steps require a relayer to support._

3. Create clients on Polymer and your rollup.

4. Create connection(s) for the different clients you've set up.

5. Create the [universal channel](../ibc-solidity/universal-channel.md).

Docs will be added with more detailed information [here](../integration/integration.md)


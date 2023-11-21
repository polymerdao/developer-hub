---
sidebar_postion: 1
sidebar_label: 'Local devnet'
---

# Run a local devnet

:::danger Placeholder
Unsure if we will include this, might skip immediately to public testnet.
:::
Steps to bring up private testnet

See also build targets in the Justfile under polymerase root dir, [here](https://github.com/polymerdao/polymerase/blob/93fb85049a5835786bc6a939df08dbfa19596296/justfile#L17).

## Clone Polymerase

```bash
git clone -b ds/private_testnet https://github.com/polymerdao/polymerase
```

## Build peptide

```bash
docker build –build-arg TOKEN=<your_git_token> -t peptide:devnet -f docker/peptide/Dockerfile .
```

## Build op-relayer

```bash
docker build -t op-relayer:devnet -f docker/oprelayer/Dockerfile .
```

## Clone polymerdao/optimism

```bash
git clone -b ds/dev-env https://github.com/polymerdao/optimism
```

## Start devnet

```bash
cd packages/contracts-bedrock && pnpm install
make submodules && git submodule update --init --recursive
make devnet-up
```

Starts 2 op-chain stacks (op-geth, op-node, op-batcher, op-proposer) and the Polymer op-stack (op-peptide, and our modified op-node/batcher/proposer)

Installs vibc-core-smart-contracts on OP chains.

LOTS of info can be found in the json files within generated “.devnet” directory

## Create IBC connections

Once devnet is up and running, attempt to create a connection with

```bash
curl localhost:4001/paths/op-polymer-1/createConnection -d '{"chainID":"901"}'
```

## Create IBC channels

```bash
curl localhost:4001/paths/op-polymer-1/createChannel -d '{
    "receiverAddress": "0xaef6d4a0E2cBB1b11d0bAe24c90cd9E0eb9d7620",
    "version": "1.0",
    "ordering": 0,
    "feeEnabled": false,
    "connectionHops": ["connection-0", "connection-3"],
    "counterparty": {
        "portID": "polyibc.eth2.37FA111284FBF97318CBe05C37fEC69071Dd4965"
    }
}'
```

## Clean up

After you're done or to restart, run:

```bash
# step 1
kill all ops-bedrock running docker containers
# step 2
docker volume rm $(docker volume ls --filter='name=ops-bedrock*' -q)
#step 3
rm -r .devnet
```

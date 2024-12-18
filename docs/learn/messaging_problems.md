---
sidebar_position: 1
sidebar_label: 'Problems with Messaging'
---

# The Problems with Messaging
At the heart of interop’s stagnation lies messaging—a system riddled with inherent flaws.

- Applications are forced to communicate through a single outbox or endpoint contract deployed by the interop protocol on every chain. 
- APIs are inflexible, dictating how applications send and receive messages.
- Messages are trapped in 1-to-1 routes, requiring developers to define tedious source-destination pairs for every interaction.

The pain doesn’t stop there. 
- Adding a new chain to the network becomes a cumbersome process, necessitating updates to contracts and configurations across multiple rollups. 
- Costs skyrocket as every message interacts with multiple contracts on multiple chains, inflating gas fees and introducing additional trust dependencies. 

The result? A system that hinders innovation and discourages developers from exploring cross-chain possibilities.

_The Prove API provides developer flexibility_

Prove API flips the script, eliminating the need for messaging altogether. Instead of forcing developers to conform to predefined standards, it empowers them to build applications on their terms. 

With the Prove API, there’s no need to interact with fixed APIs or modify smart contracts to fit interop requirements. Developers can use their existing APIs or events to create cross-chain functionality seamlessly.

This new paradigm ensures that applications retain their individuality while gaining cross-chain capabilities. By leveraging native proof types like receipt tries or storage tries, Prove API enables validation of any user actions on-chain without adding unnecessary complexity. 

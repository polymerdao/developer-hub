---
sidebar_position: 4
sidebar_label: 'Ethereum Proving'
---

# Ethereum Proving with Polymer

Polymer, as a rollup, has native access to Ethereum through its dedicated rollup bridge. By leveraging EIP-4788, it maintains a buffer of the latest known Ethereum block hashes directly within its execution environment. This built-in view of Ethereum enables Polymer to prove any action performed on Ethereum, offering a powerful and secure way to verify Ethereum-based events on other rollups.

With the Prove API, developers can tap into this capability effortlessly, enjoying a streamlined user experience without the complexities of traditional bridging methods.

### How Rollups Track Ethereum

Ethereum’s blockchain can experience reorganizations (reorgs) for recent blocks—typically affecting the last 1 or 2 blocks. To ensure stability, rollups don’t track Ethereum’s latest state in real time. Instead, they follow Ethereum after a specific confirmation depth, referred to as the `pre-conf` depth. For instance:

- Optimism: Tracks Ethereum ~12 blocks behind.
- Base: Tracks Ethereum ~15 blocks behind.

![image](https://github.com/user-attachments/assets/2f180e14-7c80-4ba6-a04d-eeb039f20e35)

This delay means that, at any given moment, different rollups may have slightly different views of Ethereum’s latest state. For users, this manifests as longer L1-to-L2 bridging times. 

:::info 
Polymer aligns with Optimism’s approach, meaning its latest known view of Ethereum (via the bridge) is approximately 120–140 seconds old. This latency will naturally affect the timing of proof requests for Ethereum-based actions.
:::

For a deeper dive into handling sub-finality and building reorg-resistant proving mechanisms, explore our open proposal: [RIP-7789](https://ethereum-magicians.org/t/rip-7789-cross-rollup-contingent-transactions/21402).

## Benefits of Using Polymer to Prove Ethereum

The Prove API eliminates common pain points in cross-layer interactions while delivering an exceptionally developer-friendly experience. Rather than crafting custom contracts for each bridge or managing intricate native bridges, you can **prove an event with a single method call**. 

Key advantages include:

- Simplified Integration: No need to wrestle with the diverse bridge implementations across rollup stacks—Prove API abstracts the complexity.
- Consistent Timing: Native bridges vary in how they track Ethereum, leading to inconsistent L1-to-L2 message delivery times. Prove API standardizes this process for predictable results.
- Beyond simplicity, Polymer enables rapid validation of any event from any rollup back to Ethereum—often within seconds—using sequencer pre-confirmations.

This unlocks a new design space, empowering applications to interoperate between rollups and Ethereum with flexible trust models tailored to your needs.

---
sidebar_position: 2
sidebar_label: 'Streamlined Developer Flow'
---

# Streamlined Developer Flow
Unlike traditional messaging, where applications rely on outbound contracts to send messages to predefined destination chains, the Prove API allows your application contract to act as the primary source. It can emit events, receipts, or write directly to storage to record user actions. In essence, your application’s existing API can now seamlessly operate across chains.

Once your application emits an event on the origin chain (typically known as source), your relayer can call the Prove API with specific details to identify the receipt (explained below). Upon receiving the proof, the relayer can immediately submit it to your application’s contract on the desired executing chain(s).

During submission, the proof is passed to the application contract where it internally invokes the CrossL2Prover with a simple function call to validate application events. This ensures the data aligns with the original transaction on the source chain before executing the required logic.

This setup gives you complete flexibility to design your own send and receive-side APIs and function calls tailored to your application’s needs.

:::tip Prove API streamlines the developer journey with just two key steps:

1.**Requesting Proof:** Use the open API to obtain a proof for a user action performed on an external rollup.
2.**Submitting Proof:** Submit the proof to your application’s contract on the executing chain (typically known as destination), where it uses CrossL2Prover to validate with a single function call.
:::

<img width="1253" alt="Screenshot 2024-12-18 at 6 50 04 PM" src="https://github.com/user-attachments/assets/1f1d2a81-0996-4224-a578-8845e4eed139" />

Polymer Protocol bundles rollup states (block headers via light clients) by accessing them through sequencer pre-confirmations. These pre-confirmations can come from traditional sequencers, a TEE, or a shared sequencing layer. The aim is to abstract the non-uniform verification methods and rollup stacks into a unified state within Polymer Hub. 

Polymer Protocol (OP-Go) functions as a rollup and ultimately settles on Ethereum. Additional security measures will be implemented to enhance the security of the Polymer Protocol's sequencer.

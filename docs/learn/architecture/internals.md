---
sidebar_position: 1
sidebar_label: 'Polymer Internals'
---

# Polymer Internals

Many interoperability protocols depend on third-party intermediaries—like DVNs or ISM validators—to sign off on cross-chain messages. These systems can feel opaque to application developers, who may not know what infrastructure supports them or who operates it. 

Polymer bridges this gap by fetching rollup state directly from the sequencer (via pre-confirmations), aligning with the same trust assumptions developers and users already accept when interacting with rollups.

![Architecture Section Docs](https://github.com/user-attachments/assets/ebfd1f07-691d-4406-b711-f49066691f5f)

These are the same assumptions when a transaction appears confirmed on a rollup explorer, users implicitly rely on:

- **Sequencer Integrity:** The sequencer must provide accurate, timely state updates. If the operator (e.g., OP Labs) acts maliciously or censors transactions, it could affect Polymer’s proving process.
- **Eventual Data Availability**: Fast confirmations depend on the sequencer submitting data to Ethereum. A failure to do so could trigger a longer-term reorg, temporarily disrupting proving.

#### Handling Variability Across Rollups

Not every rollup offers pre-confirmations for block headers or full blocks via sequencers gossip network yet. We’re on it—drafting an RIP to standardize a lightweight pre-confirmation client across sequencers, so everyone’s on the same page.

For rollups lacking this, Polymer avoids internalizing trust or running full nodes—which isn’t scalable and often opaque. Instead, we’re teaming up with [**Lit Protocol**](https://www.litprotocol.com/) to build a **verifiable RPC client**. It uses a consensus of reputed RPC providers, checked within Lit’s TEE network, to keep things reliable and shifting trust outside Polymer for greater reliability.

## Polymer Rollup the State Database

Being a rollup, the default advantage we get is that teams can always leverage verifier nodes to rebuilt polymer state from the data submitted to DA and connecting the to the sequencer - this retrospective verifiability is great but given the latencies at which apps develop on us - we want to provide stronger in run time guarantees. 

We’re actively looking into migrating our rollup to a TEE. This shift brings significant improvements:

- **Validation Guarantees**: By running the sequencer inside a TEE, it can only execute the intended code, remaining tamper-proof during runtime. This ensures the system behaves exactly as expected.
- **Equivocation Guarantees**: Running the batcher inside the TEE enclave ensures that DA submissions are immutable. Once proposed, transactions cannot be reordered or altered, eliminating the risk of discrepancies

Once we make this leap, verifier nodes can reconstruct the full rollup state with stronger real-time assurances, building the Ethereum meta-state with confidence. This isn’t just an upgrade—it’s about cutting out middlemen and giving you a secure, efficient backbone to build on.

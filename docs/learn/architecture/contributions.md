---
sidebar_position: 2
sidebar_label: 'Public Contributions'
---

# Public Contributions

At Polymer, we’ve always believed in giving back to the technologies we build with—it’s part of who we are. From our early days as core contributors to IBC and its multi-hop implementation (the biggest upgrade in two years at the time), we’ve been committed to advancing the ecosystems we’re part of. Today, that spirit continues in the Ethereum community, where we’re actively shaping standards through RIPs, the Ethereum Interop Forum, and other public efforts.

Here’s where we’re making a difference right now:

- ERC-7683 and Open Intents Framework
- Uniswap’s TheCompact Resource-Lock Implementation
- RIP-7786 Messaging Standards

Beyond these, we’ve proposed several RIPs that are gaining traction—especially with teams like Off-Chain Labs. Let’s dive into two of our key contributions.

### RIP-7589: L1 Historical View on Rollups

**Authors**: Ian Norden, Bo Du, Christian Angelopoulos , Mark Tyneway

We know how tricky it can be to sync up rollups with Ethereum’s state in a reliable way. That’s why [RIP-7589](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7859.md) proposes standardizing a trusted L1 view that each rollup follows. This makes native interoperability via Ethereum smoother and sets the stage for proposals like RIP-7789. F

or example, OP Stack rollups already use EIP-4788 to store the last 27 hours of Ethereum block hashes—giving them a consistent window into L1.

We’re thrilled to see Off-Chain Labs embracing this idea in EIF discussions. Soon, you’ll see support for it on the Orbit Stack and Arbitrum One, making it easier for you to build with confidence across rollups.

### RIP-7789: L1 Consistency Check (Reorg Protection at Sub-Finality)

**Authors:**  Bo Du, Devain Pal Bansal, Ian Norden

Building on [RIP-7789](https://ethereum-magicians.org/t/rip-7789-cross-rollup-contingent-transactions/21402), this proposal takes things further. It uses the latest known Ethereum view on a rollup to ensure that rollups communicating cross-chain are on the same Ethereum fork. 

By tying messages or proofs to this view, we can catch issues like a rollup following the wrong fork—or an Ethereum reorg—before they cause trouble. If something’s off, transactions fail safely when replayed, giving you atomic guarantees for sub-finality, reorg-protected communication.

We had this live in Polymer for a while, but deprecated it due to limited demand. Still, it’s a concept we believe in, and we’re open to revisiting it if the need grows—your feedback matters here.

### What’s Next: Upcoming RIPs

We’re not stopping there. Here’s what we’re working on to keep pushing the ecosystem forward:

- Standardizing Pre-Confirmation Light Clients in Sequencers: This will let us expand to more rollups with a stronger trust model, cutting latency and boosting censorship resistance. It’s about making Polymer work better for you, wherever you’re building.
- L1 Registry of L2 Output Oracles: We’re laying the groundwork for an Ethereum-based fallback system, so applications can validate proofs directly via Ethereum. A big hurdle? L2 contracts need to know where other rollups’ states are posted on L1. This registry standardizes that context, simplifying your cross-rollup workflows.

## Why This Matters to You

We’re not just contributing for the sake of it—we’re doing this to make your life as a developer easier. Whether it’s standardizing how rollups talk to Ethereum or paving the way for faster, safer interop, our work is about creating tools and frameworks you can rely on. 

We’re proud to collaborate with the community, and we’d love to hear how these efforts can support your projects. Together, we’re building a stronger Ethereum ecosystem.

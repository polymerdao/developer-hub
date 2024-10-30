---
sidebar_position: 1
sidebar_label: 'Developer Launchpad'
---

# Developer Launchpad

Polymer Hub at its core (low level functionality) gathers state updates (e.g., block headers) from various rollups, aggregates them into a single state, and then shares this state across rollups—all accomplished using light clients (similar to IBC). By storing state updates, Polymer Hub enables rollups to verify any event log on any other chain.

On top of this low-level state protocol sits the **application layer messaging primitive**, which this documentation focuses on. It follows IBC topology and allows applications to open communication channels between their smart contracts deployed on various chains, define contract endpoints with unique port IDs, and send messages to execute actions over them.

![image (43)](https://github.com/user-attachments/assets/6aeeb0dc-c1b9-4c1e-94bb-ef8975bdd8e4)

:::tip

You can use channels and ports as your own application bridge over the underlying state-sharing protocol to prove and send your own application messages. Once you application sets up a channel, only your application can use it, thus channel IDs help in authenticating the source of information at the smart contract level. 

:::

See an example:
![image (44)](https://github.com/user-attachments/assets/17c2089c-c558-4384-8f87-44352945e597)

- **Source Port Address and Destination Port Address**: These are your smart contracts, prefixed by the chain given contract is deployed on (e.g. "polyibc.optimism."). Only these smart contracts can send messages over the channels they've done a successful channel handshake with.  Note: channelIds are always encoded as utf8 encoded bytes, and are usually prefixed with "channel-" in bytes, which is  "0x6368616e6e656c2d".
- **Send Transaction**: This is the sending transaction from the source chain, which will be sent via, say, a source channelId of 0x6368616e6e656c2d3137, which corresponds to "channel-17", and a destination channel id of 0x6368616e6e656c2d3138, which corresponds to "channel-18" encoded as utf8-bytes. A packet contains both the source and destination channel Ids it is sent over.
- **Receive Transaction**: This transaction handles the execution on a remote chain, and if there is an acknowledgment to be sent back to the source, it be sent back over the source channelId of 0x6368616e6e656c2d3137 and destination channel id of 0x6368616e6e656c2d3138
- **Acknowledgement transaction:** Sometimes, it's useful to have the source chain get a notification when a packet has been received on the destination chain. If you have logic which needs to be actuated when the destination chain receives your packet, you can implement logic in the Acknowledgement phase. The acknowledgement will contain the same source and desination portIds as the other two steps in the handshake, 0x6368616e6e656c2d3137 for the source port id and 0x6368616e6e656c2d3138 for the destination port id.

![image (45)](https://github.com/user-attachments/assets/fea24a1f-b782-4867-9a30-392763b85df8)

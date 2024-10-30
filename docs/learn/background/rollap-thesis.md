---
sidebar_position: 4
sidebar_label: 'Rollapp Thesis and Polymer'
---

# Nexus of 1000s of Rollups
![image (26)](https://github.com/user-attachments/assets/212a09ed-cb40-4772-83ba-1f4b6ff9f3df)

With over 200 rollups and growing, tracking each rollup's alignment with Ethereum is becoming complex. Although Ethereum rarely experiences deep reorgs (typically up to 2 blocks and max seen upto 7 blocks), even minor discrepancies can disrupt closely following rollups.

Bringing rollups closer in blockspace is crucial, especially as transaction times decrease (e.g., milliseconds for rollups like MegaETH). High finality gap between rollups hinders application development, forcing new rollups to repeatedly deploy the same primitives instead of focusing on specialized use cases.

## Polymer Hub: Uniting Ethereum Rollup Blockspace
![image (27)](https://github.com/user-attachments/assets/a308085f-c29d-4c21-bf19-e46f05ac9d92)

Polymer Hub is a networking protocol designed to connect Ethereum rollups by sharing state updates between them. This mechanism is similar to the IBC protocol, where a blockchain receives light client updates from a counterpart chain. By facilitating the exchange of state updates, Polymer Hub enables rollups to verify any event log on any other chain.

![image (28)](https://github.com/user-attachments/assets/ee47758e-2dcb-427e-8c9d-bc7502ba5f9b)

To ensure that rollups communicating within the finality gap are on the correct fork of Ethereum, Polymer Hub operates as a rollup on Ethereum itself. Being a rollup allows it to be directly connected to both Ethereum and other rollups, ensuring consistency and alignment across the network.

![image (29)](https://github.com/user-attachments/assets/41881778-2fe7-41e2-99ef-4e8cf15413d0)
- Rollups A, B and C will be allowed to communicate with each other in real time.
- But any state updates going to B to A’ will fail the Ethereum consistency check as A’ is on a different fork. The same is true with B’ trying to communicate with others.

This design addresses the challenges posed by the finality gap and fosters a more unified rollup ecosystem.

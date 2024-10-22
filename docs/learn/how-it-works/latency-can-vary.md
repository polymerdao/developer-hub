---
sidebar_position: 4
sidebar_label: 'Why Latency Can Vary'
---


# Sub-Finality In Action

Polymer Labs has contributed a rollup improvement proposal, RIP-7789 to talk about the importance of L1 origin and part it play for rollup communications. Read more about [RIP-7789](https://ethereum-magicians.org/t/rip-7789-cross-rollup-contingent-transactions/21402).

This is practical example with Base and Optimism on Ethereum mainnet. Both have a gap between their L1 origins:

![image (36)](https://github.com/user-attachments/assets/7701bdf7-37b9-48d0-905c-f3d6ecd06d16)

- **Optimism:** L1 origin at block 11.
- **Base:** L1 origin at block 16.

:::INFO
 
`Minimum Finality Gap` =  (`Delta of L1Origins` - 1) x `Ethereum Block Time`

:::

### Implecations
- **Rollup Knowledge:** Optimism references Ethereum up to 11 blocks deep, while Base references up to 16 blocks. This mean the Optimism lacks the knowledge of Ethereum beyond the 11th block and for Base this is even larger i.e the first 16 Ethereum blocks.

![image (37)](https://github.com/user-attachments/assets/20128dcb-59e0-415b-b1f4-99eec6128452)

![image (38)](https://github.com/user-attachments/assets/2aa08491-e44b-4c29-965d-650b9c5fd9c5)

- **State Sharing from Base to Optimism:** Since Optimism's L1 origin is ahead of Base's, Optimism can verify Base's fork by checking that Base's L1 origin exists in its Ethereum history.
![image (39)](https://github.com/user-attachments/assets/6aa0c0f9-0fba-43f3-a889-5f071ef81907)

- **State Sharing from Optimism to Base:** Base cannot verify Optimism's state immediately because it lacks knowledge of Ethereum blocks beyond its L1 origin at block 16.

![image (40)](https://github.com/user-attachments/assets/036665a3-c448-45fc-8656-09cba00c8d99)

Minimum Finality Gap: To share Optimism's state with Base, we need to wait until Base's L1 origin advances past block 4. This introduces a minimum finality gap calculated as: For this example, the gap is `(16 - 11 - 1) × 12 seconds = 48 seconds`.

:::TIP

Developers should consider these finality gaps when designing application-specific rollups that interact closely with others.

:::

### Sample of a mainnet transaction:
![image (41)](https://github.com/user-attachments/assets/ec2f0c3d-7131-40a1-9d47-5bd230be3950)
- Latency Base to Optimism: 10-15 secs
- Latency Optimism to Base: 50-60 secs

---
sidebar_position: 1
sidebar_label: 'Ethereum Finality'
---

# Ethereum's Finality

:::

For context of the Sacred Timeline, see [here](https://www.tumblr.com/rekaspbrak/661582984296775680/adorablelokie-how-does-the-sacred-timeline-and)

:::

## Ethereum: The Sacred Timeline of Finality

![image (31)](https://github.com/user-attachments/assets/7fb13a23-d185-4b85-b277-5c04ecf949fc)
<br/>
<br/>
Ethereum's rollup-centric roadmap aims to scale the usability of its decentralized and secure blockspace, bolstered by significant staking. While this approach enhances security and inclusivity (like solo stakers), it encounters a **finality problem**.

### Finality of Ordering
Ethereum operates on a probabilistic model where transactions aren't fully confirmed until after two epochs—approximately 13 minutes under normal network conditions. Until this finality is reached:

![image (21)](https://github.com/user-attachments/assets/66ca59e3-377f-4bb8-a7db-512bf56526f5)

- **Forks May Occur**: Ethereum can have different forks based on the transactions included in a block, leading to diverging views
- **Delayed Confirmations**: It can take significant time to finalize transactions (horizontal relationship to finality).

Thus, the primary settlement layer for rollups requires about 13 minutes to achieve finality, prompting the question: **How do rollups ensure they align with Ethereum's timeline?**

:::tip

These factors are typically defined in the native bridge of a rollup at the time of deployment.

:::

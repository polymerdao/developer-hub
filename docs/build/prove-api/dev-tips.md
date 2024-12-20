---
sidebar_position: 3
sidebar_label: 'Developer Tips'
---

# Developer Tips

### End to end latency: 6-10 secs 
- In the current version (V0), the Proof API typically takes 6-10 seconds to return a proof response due to lazy updates. This delay ensures that the latest rollup states are propagated to the destination chain and successfully updated.
- The primary bottleneck lies in rollup block times. Once the proof is received, you can immediately execute your function.
- All of the proofs described above can be built using public RPCs. The primary function of the Prove API is to provide convenience and manage the coordination across multiple chain RPCs.


### Cost of validateReceipt: ~270k gas
  - In the current version (V0), the Proof API supports proving both receipts, logs and events, with the proof structure remaining identical in both scenarios.
  - The estimated cost of calling `validateReceipt` is approximately ~270k.
  - To optimize proving costs, it is recommended to group multiple logs under a single receipt whenever possible.
  - Once a receipt has been successfully proven, you can iterate through and execute each log independently by using `parseLog`.


<br/>
<br/>


- Currently, the proof size is large, which increases the L1 fees paid on L2. Despite this, the overall cost of proving a packet remains lower than standard messaging protocols. (Refer to the fee comparison below.)
- Polymer hub supports broadcast-style proof pulling, which means there is a many-to-many relationship with the chain. As an application developer, you must implement replay protection mechanisms to handle this effectively.
    - This can be done with the help of identifiers returned during `validateReceipt` or `parseLog`, applications can manage their context with source chain ID, emitting contract.
    - Furthermore it is recommended to define unique userOps or settlement order by hashing over the operation and the chains they are indeed for, this way applications can remove any form of trust in their own relayer as well.  

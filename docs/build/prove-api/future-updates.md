---
sidebar_position: 4
sidebar_label: 'Future Updates'
---

# Future Updates

## What is coming in the next versions?

### Your feedback is valuable to prioritize these features

<br/>

#### Passive Event Indexing (Proof cost < 100k)
Passive Event/Receipt Indexing compresses the proof size to a single IAVL proof, reducing the cost of verification well below 100k and significantly reducing L1 gas fee. This is achieved by pre-verifying them on the Polymer hub with MMPT and then committing it to our state, so that it is directly accessible via the App-hash.



#### Proving storage
We plan to support more claims like validateStorage or validateSrcHeader as well as more methods like executeMessage that will send the safe payload to a defined address.



#### Active Event Indexing 
Active Event Indexing involves pre-registering your contract to generate proofs faster. However, it could result in unnecessary work if the solver does not request the event proofs.



#### Batched IAVL Proving (Proof cost < 40k)
Batched IAVL Proving enables efficient packing of multiple events in an IAVL tree. For IAVL trees, each individual proof size is like O(log(N)) hashes for the depth of the tree (N = number of nodes). 

For 'k' individual event proofs, it would be k * O(log(N)). For batched proof, the proof size is like O(log(N)) + k, which leads to savings of k * O(log(N)) - (O(log(N)) + k).

Example:
- Let N = 2^10 = 1024 (tree has 1024 nodes) and k = 10 queried keys.
- Without batching: 10 * log2(1024) = 10 * 10 = 100 hashes.
- With batching: log2(1024) + 10 = 10 + 10 = 20 hashes.
- Savings: 100 - 20 = 80% reduction.



#### Batched ZK Proving 
Batched ZK Proving involves packing multiple events into a static size ZK proof by pre-verifying them on the Polymer hub. We are already exploring this approach, the biggest downside of this approach is the time trade off, it takes more time to prove an increasing number of events. 

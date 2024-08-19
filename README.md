## Mythos Airdrop v4


Using the following Data Sources from [Colorful Notion](./COLORFULNOTION.md) and [Parity Data](https://docs.google.com/spreadsheets/d/1vjiuA-qZvBOvWD8cs8Z0aXoqnpuWjfbt_y2hh5adSFI/edit?gid=1618838395#gid=1618838395), we have drafted a [Mythos Airdrop v4](https://dune.com/substrate/mythos-airdrop-v4) and finalized [Raw Active Users](./mythos-airdrop-v4-activeusers-20240818.csv).

One entity in a 2/3 multisog can submit the batches with `asMulti`, and a second entity in the same multisig will.  See [Polkadot Wiki](https://wiki.polkadot.network/docs/learn-guides-accounts-multisig) for background.

The following scripts have been drafted:
* [airdrop-generateBatches.js](./airdrop-generateBatches.js) - Maps active users into the raw call data in the 643 directory, where the filename contains the call hash.  
* [airdrop-asMulti.js](./airdrop-asMulti.js) - For all the files in the 643 directory, uses the "asMulti" to submit the batch.
* [airdrop-approveAsMulti.js](./airdrop-approveAsMulti.js) - For all the files in the 643 directory, uses the "approveAsMulti" to approve the batch.

Under development:
* Adding in inactive users to `airdrop-generateBatches.js`
* `airdrop-need-ED.js` - script to check balances of addresses in the CSV that need Existential Deposit (0.01 DOT) and submits transfer.
* `airdrop-check-airdrop.js` - script to check MYTH balances of addresses in the CSV file, and outputs which addresses do NOT have the MYTH in the CSV file.







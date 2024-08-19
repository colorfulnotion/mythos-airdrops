## Mythos Airdrop v4

See [Mythos dashboard](https://dune.com/substrate/mythos) for background and [Mythos Airdrop v4 (DRAFT)](https://dune.com/substrate/mythos-airdrop-v4) for the latest version under consideration, which combines Data Sources from [Colorful Notion](./COLORFULNOTION.md) and [Parity Data](https://docs.google.com/spreadsheets/d/1vjiuA-qZvBOvWD8cs8Z0aXoqnpuWjfbt_y2hh5adSFI/edit?gid=1618838395#gid=1618838395).  

From the [active users query here](https://dune.com/queries/3983432/6703763), taking the MAX from both data sources and put them here in the [mythos-airdrop-v4-activeusers-20240818.csv](./mythos-airdrop-v4-activeusers-20240818.csv)  file.

## Airdrop execution

The basic strategy for airdrop is to use a 2/3 multisig (see [Polkadot Wiki](https://wiki.polkadot.network/docs/learn-guides-accounts-multisig) for background on multisigs) and follow this:

1. Generate 1250 batches of around 382 addresses per batch, put them in a 643 directory.
2. One entity in a 2/3 multisig can submit the batches with `asMulti`.
3. A second entity in the same multisig will approve the same multisig with `approveAsMulti`

The following scripts have been drafted to support the MYTH airdrop:
* [airdrop-generateBatches.js](./airdrop-generateBatches.js) - Maps active users into the raw call data in the 643 directory, where the filename contains the call hash.  
* [airdrop-asMulti.js](./airdrop-asMulti.js) - For all the files in the 643 directory, uses the "asMulti" to submit the batch.
* [airdrop-approveAsMulti.js](./airdrop-approveAsMulti.js) - For all the files in the 643 directory, uses the "approveAsMulti" to approve the batch.

Currently the 643 directory has just the active users.

### Next steps:

* Adding in inactive users to `airdrop-generateBatches.js`
* Develop `airdrop-need-ED.js`, a script to check balances of addresses in the CSV that need Existential Deposit (0.01 DOT) and submits transfer
* Develop `airdrop-check-airdrop.js`, a script to check MYTH balances of addresses in the CSV file, and outputs which addresses do NOT have the MYTH in the CSV file







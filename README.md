## Mythos Airdrop v4

See [Mythos dashboard](https://dune.com/substrate/mythos) for background and [Mythos Airdrop v4 (DRAFT)](https://dune.com/substrate/mythos-airdrop-v4) for the latest version under consideration, which combines Data Sources from [Colorful Notion](./COLORFULNOTION.md) and [Parity Data](https://docs.google.com/spreadsheets/d/1vjiuA-qZvBOvWD8cs8Z0aXoqnpuWjfbt_y2hh5adSFI/edit?gid=1618838395#gid=1618838395).  

* Active Users: [Query](https://dune.com/queries/3983432/6703763) takes the MAX from both data sources and puts them in [mythos-airdrop-v4-activeusers-20240818.csv](./mythos-airdrop-v4-activeusers-20240818.csv)
* Inactive Users: [Query](https://dune.com/queries/3998394) takes the addresses that have balances between 10 DOT and 5K DOT but are not in the above data and puts them in [mythos-airdrop-v4-inactiveusers-20240818.csv](./mythos-airdrop-v4-inactiveusers-20240818.csv)

## Airdrop execution

The basic strategy for airdrop is to use a 2/3 multisig (see [Polkadot Wiki](https://wiki.polkadot.network/docs/learn-guides-accounts-multisig) for background on multisigs) using these 3 scripts:
* [airdrop-generateBatches.js](./airdrop-generateBatches.js) - Maps active+inactive addresses into the raw call data in the 643 directory in 14 groups, where the filename contains the call hash.  
* [airdrop-asMulti.js](./airdrop-asMulti.js) - For all the files in the 643 directory, uses the "asMulti" to submit the batch (if production=true)
* [airdrop-approveAsMulti.js](./airdrop-approveAsMulti.js) - For all the files in the 643 directory, uses the "approveAsMulti" to approve the batch (if production=true)

The 643 directory has both active addresses + inactive addresses making up 1245 batches, in 14 groups.  The latter 2 scripts take a group input, e.g. "b1" through "b15"

1. Generate 1245 batches of approximately 382 addresses per batch, put them in a 643 directory, organized in 14 groups of around 750K MYTH each.  

```
# node airdrop-generateBatches.js > airdrop-generateBatches.log
# grep GROUP airdrop-generateBatches.log
GROUP 1: 748960 MYTH to 59365 addresses
GROUP 2: 748960 MYTH to 59365 addresses
GROUP 3: 748960 MYTH to 59365 addresses
GROUP 4: 748960 MYTH to 59365 addresses
GROUP 5: 748960 MYTH to 59365 addresses
GROUP 6: 750003 MYTH to 57067 addresses
GROUP 7: 751020 MYTH to 42513 addresses
GROUP 8: 748650 MYTH to 40215 addresses
GROUP 9: 747060 MYTH to 18767 addresses
GROUP 10: 727639 MYTH to 13405 addresses
GROUP 11: 675561 MYTH to 4979 addresses
GROUP 12: 509178 MYTH to 1532 addresses
GROUP 13: 750282 MYTH to 766 addresses
GROUP 14: 708957 MYTH to 612 addresses
```


2. The FIRST entity in a 2/3 multisig will submit the batches with `asMulti`.

```
node airdrop-asMulti.js b1
...
node airdrop-asMulti.js b14
```

3. A SECOND entity in the same multisig will approve the same multisig with `approveAsMulti`

```
node airdrop-approveAsMulti.js b1
...
node airdrop-approveAsMulti.js b14
```


### Other scripts:

* `airdrop-check.js`, a script to check ED+MYTH balances of addresses in the batches generated, and outputs which addresses do NOT have (a) any DOT, and likely need .01 DOT (to send with `airdrop-sendED.js`) (b) MYTH to be checked
* `airdrop-sendED.js`, a script to send .01 DOT ED to

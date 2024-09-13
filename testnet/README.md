Here we tested 16 batches  by adjusting the MYTH airdrop to airdrop JAM to 5.8K+ addresses in 16 batches in 6 groups from https://dune.com/queries/4066509
The addresses set here all have 5K DOT or more in the exact same snapshot so its mutually exclusive with the production MYTH airdrop.

```
GROUP 1: 58422 MYTH to 2681 addresses  -- 7/7 complete
GROUP 2: 68944 MYTH to 1532 addresses  -- 4/4 complete
GROUP 3: 49028 MYTH to 766 addresses   -- 2/2 complete
GROUP 4: 71922 MYTH to 383 addresses   -- 1/1 complete
GROUP 5: 90244 MYTH to 383 addresses   -- 1/1 complete
GROUP 6: 117862 MYTH to 114 addresses  -- 1/1 complete
```

Test complete 9/12:
* `testnet-airdrop-activeusers.csv` from https://dune.com/queries/4066509

* `node airdrop-generateBatches.js >  airdrop-generateBatches.log` used to generate call data in 643 directory

* `node airdrop-check.js b6` ... `node airdrop-check.js b1` used to check whether ED was needed

* `node airdrop-sendED.js` used to send ED to around 166 addresses (see `addresses.txt`)

* `node airdrop-asMulti.js b6` ... `node airdrop-asMulti.js b1` -- initiated utility.batch ([sample](https://assethub-polkadot.subscan.io/extrinsic/7113766-4)) from
[13diZnYMiakbUqdYJhgr4QkAnpFd4LVA8aAG3wUkrpkDAbw5](https://assethub-polkadot.subscan.io/account/13diZnYMiakbUqdYJhgr4QkAnpFd4LVA8aAG3wUkrpkDAbw5)
Fee 0.167 DOT

* `node airdrop-approveAsMulti.js b6` ... `node airdrop-asMulti.js b1` (with file based submission as well) approved+executed utility.batch ([sample](https://assethub-polkadot.subscan.io/extrinsic/7113778-2)) from [13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ](https://assethub-polkadot.subscan.io/account/13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ) Fee 0.406 DOT

* `node airdrop-check.js b6` ... `node airdrop-check.js b1` used to check execution of the above


We can estimate both .57 DOT x 1245=710 DOT (assuming no retries).


Here we tested sending 1 batch of 7 MYTH to 4 addresses with a 2/3 multisig:

```
C 13diZnYMiakbUqdYJhgr4QkAnpFd4LVA8aAG3wUkrpkDAbw5 FIRST
A 13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ LAST
S 121Rs6fKm8nguHnvPfG1Cq3ctFuNAVZGRmghwkJwHpKxKjbx
```

Test complete 9/12:
* `mythos-airdrop-v4-activeusers-20240818.csv` and `mythos-airdrop-v4-inactiveusers-20240818.csv` adjusted manually

* `node airdrop-generateBatches.js >  airdrop-generateBatches.log` used to generate call data in 643 directory

* `node airdrop-check.js b1` used to check whether ED was needed

* `node airdrop-sendED.js` used to send ED to  1 address (see `addresses.txt`)

* `node airdrop-asMulti.js b1` -- initiated utility.batch ([sample](https://assethub-polkadot.subscan.io/extrinsic/7114457-2))
Fee 0.167 DOT

* `node airdrop-approveAsMulti.js b1` approved+executed utility.batch ([sample](https://assethub-polkadot.subscan.io/extrinsic/7114461-2))  Fee 0.406 DOT

* `node airdrop-check.js b1` used to check execution of the above

```
% node airdrop-check.js b1
2024-09-12 23:22:17        API/INIT: RPC methods not decorated: chainHead_v1_body, chainHead_v1_call, chainHead_v1_continue, chainHead_v1_follow, chainHead_v1_header, chainHead_v1_stopOperation, chainHead_v1_storage, chainHead_v1_unfollow, chainHead_v1_unpin, chainSpec_v1_chainName, chainSpec_v1_genesisHash, chainSpec_v1_properties, transactionWatch_v1_submitAndWatch, transactionWatch_v1_unwatch, transaction_v1_broadcast, transaction_v1_stop
Processing group:  b1
Executing 0000-0x97c1d2a9f99432c3905cf7f03dc690ab2ca105653e303a72e2329cf0b592b76c-7-3.log
14QT3gXBmzj8ZqwtKrxGHvsyXUL1m1hcT8rqUfe78thmB29j:1000000000000000000:OKDOT:OKMYTH
13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ:2000000000000000000:OKDOT:OKMYTH
12j7ydmwGoPr1WxPcYx1u34G8wxSW4vgwTCwKP6AgsPtVvH1:3000000000000000000:OKDOT:OKMYTH
13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ:1000000000000000000:OKDOT:OKMYTH
Log written to: 643/b1/log/0000-0x97c1d2a9f99432c3905cf7f03dc690ab2ca105653e303a72e2329cf0b592b76c-7-3.log
```

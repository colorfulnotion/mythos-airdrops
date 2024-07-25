# Mythos Airdrop v3 (draft) Data Sources

This has all the queries used for [OpenGov Ref #643 - Mythos airdrop](https://dune.com/substrate/mythos) "Active Users".
It has been compiled by [Colorful Notion](https://t.me/colorfulnotion), catalyst for Polkadot Dune dashboards via [OpenGov Ref #366](https://polkadot.polkassembly.io/referenda/366) (see [Polkadot wiki](https://wiki.polkadot.network/docs/general/polkadot-ecosystem-overview) ) and Developer of [Dotswap.org](https://dotswap.org) which will support MYTH trading on Polkadot Asset Hub -- see [OpenGov Ref #988](https://polkadot.polkassembly.io/referenda/988).   

This airdrop is being audited by:
* Ollie @ Parity Data
* Gautam @ Blockdeep
* Tommi Enenkel aka alice_und_bob

See this [Mythos Airdrop Proposal v3 (draft)](https://docs.google.com/spreadsheets/d/1Nmw5hsHUkEPjkTGE5WQ56W3O6L463_3i1aWOE3HRhOA/edit?gid=1859566459#gid=1859566459) for a compact summary.


Key Contacts: TG @sourabhniyogi + @mkchungs (Colorful Notion) + @mnafta (Scytale)

## Active Users Query

[Mythos distribution to Active Users](https://dune.com/queries/3605813/6075513)

```
--[dataset_xcmtransfers]	Criteria 1.0: User has executed xcm transfer between 10/1/23-3/29/24
--[dataset_xcmtransfers]	Criteria 1.1: Include XCM transfers between AssetHub, Moonbeam, Astar, HydraDX (10/1/23-3/29/24)
--[dataset_xcmtransfers]	Criteria 1.2: 10 or more xcm transfers between 10/1/23-3/29/24
--[query_3605720]  	Criteria 2: User is staking DOT (solo or nomination pool) on 3/29/24
--[query_3605729] 	Criteria 3: User has compounded or staked additional funds between 10/1/23-3/29/24
--[dune.substrate.dataset_mythos_airdrop_criteria4] Criteria 4: User has voted in OpenGov refs starting/finishing between 10/1/23-3/29/24
--[query_3605750] 	Criteria 5 - User has participated in a crowdloan before 3/29/24
--[query_3605764] 	Criteria 6 - User has participated in a crowdloan between 10/1/23-3/29/24

WITH
  s AS (
    SELECT
      address_ss58,
      CAST(total AS UINT256) / POW(10, 10) AS total
    FROM
      dune.substrate.dataset_mythos_snapshot
  ),
  xs AS (
    SELECT
      s.address_ss58,
      s.total AS snapshot,
      COALESCE(nompool_total, 0) AS nompool,
      s.total + COALESCE(nompool_total, 0) AS total
    FROM
      s
      LEFT JOIN query_3642228 ON s.address_ss58 = query_3642228.address_ss58
  ),
  x AS (
    SELECT
      xs.address_ss58,
      xs.snapshot,
      xs.nompool,
      COALESCE(total_contribution, 0) AS crowdloan,
      xs.total + COALESCE(total_contribution, 0) AS total
    FROM
      xs
      LEFT JOIN query_3642291 ON xs.address_ss58 = query_3642291.address_ss58
  ),
  x_10_5k_holders AS (
    SELECT * 
    FROM x 
    WHERE total >= 10 AND total < 5000 -- only holders with DOT balances between 10 - 5k are eligible for Mythos Airdrop
 ) , 
indicators AS (
    
    SELECT address_ss58, 0 AS criteria1, 0 AS criteria11, 0 AS criteria12, 0 AS criteria2, 0 AS criteria3, 0 AS criteria4, 0 AS criteria5, 0 AS criteria6, snapshot, crowdloan, nompool, total 
        FROM x_10_5k_holders
    UNION ALL
        
    
    --Criteria 1.0: User has executed xcm transfer between 10/1/23-3/29/24
    SELECT address_ss58, 1 AS criteria1, 0 AS criteria11, 0 AS criteria12, 0 AS criteria2, 0 AS criteria3, 0 AS criteria4, 0 AS criteria5, 0 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM query_3940743)
    UNION ALL
    
    --Criteria 1.1: Include XCM transfers between AssetHub, Moonbeam, Astar, HydraDX (10/1/23-3/29/24)
    SELECT address_ss58, 0 AS criteria1, 1 AS criteria11, 0 AS criteria12, 0 AS criteria2, 0 AS criteria3, 0 AS criteria4, 0 AS criteria5, 0 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM query_3940767)
    UNION ALL
    
    --Criteria 1.2: 10 or more xcm transfers between 10/1/23-3/29/24
    SELECT address_ss58, 0 AS criteria1, 0 AS criteria11, 1 AS criteria12, 0 AS criteria2, 0 AS criteria3, 0 AS criteria4, 0 AS criteria5, 0 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM query_3940755)
    UNION ALL
    
    -- Criteria 2: User is staking DOT (solo or nomination pool) on 3/29/24
    SELECT address_ss58, 0 AS criteria1, 0 AS criteria11, 0 AS criteria12, 1 AS criteria2, 0 AS criteria3, 0 AS criteria4, 0 AS criteria5, 0 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM query_3605720)
    UNION ALL
    
     -- Criteria 3: User has compounded or staked additional funds between 10/1/23-3/29/24
    SELECT address_ss58, 0 AS criteria1, 0 AS criteria11, 0 AS criteria12, 0 AS criteria2, 1 AS criteria3, 0 AS criteria4, 0 AS criteria5, 0 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM query_3605729)
    UNION ALL
    
    -- Criteria 4: User has voted in OpenGov refs starting/finishing between 10/1/23-3/29/24
    SELECT address_ss58, 0 AS criteria1, 0 AS criteria11, 0 AS criteria12, 0 AS criteria2, 0 AS criteria3, 1 AS criteria4, 0 AS criteria5, 0 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM dune.substrate.dataset_mythos_airdrop_criteria4)
    UNION ALL
    
    -- Criteria 5 - User has participated in a crowdloan before 3/29/24
    SELECT address_ss58, 0 AS criteria1, 0 AS criteria11, 0 AS criteria12, 0 AS criteria2, 0 AS criteria3, 0 AS criteria4, 1 AS criteria5, 0 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM query_3605750)
    UNION ALL
    
    -- Criteria 6 - User has participated in a crowdloan between 10/1/23-3/29/24
    SELECT address_ss58, 0 AS criteria1, 0 AS criteria11, 0 AS criteria12, 0 AS criteria2, 0 AS criteria3, 0 AS criteria4, 0 AS criteria5, 1 AS criteria6, 0 AS snapshot, 0 AS crowdloan, 0 AS nompool, 0 AS total 
        FROM x_10_5k_holders WHERE address_ss58 IN (SELECT address_ss58 FROM query_3605764)
  )


SELECT 
  address_ss58, 
  39 * SUM(criteria1) + 
  104 * SUM(criteria11) + 
  872 * SUM(criteria12) + 
  17  * SUM(criteria2) + 
  28 * SUM(criteria3) + 
  182 * SUM(criteria4) + 
  18 * SUM(criteria5) + 
  77 * SUM(criteria6) AS airdrop_amount, 
  SUM(total) AS total_dot, 
  SUM(snapshot) AS snapshot_dot, 
  SUM(nompool) AS nompool_dot, 
  SUM(crowdloan) AS crowdloan_dot, 
  SUM(criteria1 + criteria11 + criteria12 + criteria2 + criteria3 + criteria4 + criteria5 + criteria6) AS num_criteria, 
  SUM(criteria1) AS criteria1, 
  SUM(criteria11) AS criteria11, 
  SUM(criteria12) AS criteria12, 
  SUM(criteria2) AS criteria2, 
  SUM(criteria3) AS criteria3, 
  SUM(criteria4) AS criteria4, 
  SUM(criteria5) AS criteria5, 
  SUM(criteria6) AS criteria6 
FROM 
  indicators 
GROUP BY 
  address_ss58 
HAVING 
  SUM(criteria1 + criteria11 + criteria12 + criteria2 + criteria3 + criteria4 + criteria5 + criteria6) > 0 
ORDER BY 
  airdrop_amount DESC
```

Notes concerning the above query:
* source balance snapshot data is from `dataset_mythos_snapshot`  was obtained from Ramsey @ Decentration (who did the DED snapshot) but further extended based on community requests to include:
	*  nomination pools [`query_3642228`](https://dune.com/queries/3642228) and 
	*  crowdloan contributions [`query_3642291`](https://dune.com/queries/3642291) 
	(see Balances Info)
* `dataset_xcmtransfers` is used for 
	* Criteria 1.0: User has executed xcm transfer between 10/1/23-3/29/24
	* Criteria 1.1: Include XCM transfers between AssetHub, Moonbeam, Astar, HydraDX (10/1/23-3/29/24)
    * Criteria 1.2: 10 or more xcm transfers between 10/1/23-3/29/24
* [`query_3605720`](https://dune.com/queries/3605720) Criteria 2: User is staking DOT (solo or nomination pool) on 3/29/24 is listed below 
* [`query_3605729`](https://dune.com/queries/3605729) Criteria 3: User has compounded or staked additional funds between 10/1/23-3/29/24
* [`query_3605789`](https://dune.com/queries/3605789) Criteria 4: User has voted in OpenGov refs starting/finishing between 10/1/23-3/29/24
* [`query_3605750`](https://dune.com/queries/3605750) Criteria 5 - User has participated in a crowdloan before 3/29/24
* [`query_3605764`](https://dune.com/queries/3605764) Criteria 6 - User has participated in a crowdloan between 10/1/23-3/29/24

* Each of the above criteria is put into one of 8 "indicator" attributes (0 or 1)  `criteria1` ... `criteria6`  with the `airdrop_amount`  based on the weighted combination of these
``` 39 * SUM(criteria1) + 
  104 * SUM(criteria11) + 
  872 * SUM(criteria12) + 
  17  * SUM(criteria2) + 
  28 * SUM(criteria3) + 
  182 * SUM(criteria4) + 
  18 * SUM(criteria5) + 
  77 * SUM(criteria6) 
```
These weights were determined by Michael Naftaliev and implemented by Sourabh Niyogi
 
## Balances Info:
 
* ```dune.substrate.dataset_mythos_snapshot``` provided by Ramsey of Decentration, uploaded manually as a CSV file, at 2024-03-29 11:00:30 UTC @ B;p https://polkadot.subscan.io/block/20109444

* [query_3642228](https://dune.com/queries/3642228) 
```
select
  address_ss58,
  sum(member_bonded + member_unbonded) as nompool_total
from
  polkadot.stakings
where
  section = 'NominationPools'
  and storage = 'PoolMembers'
  and era = 1397
  group by 1 order by 2 desc
```

* [query_3642291](https://dune.com/queries/3642291) 
```
with
  crowdloadn as (
    SELECT
      JSON_EXTRACT_SCALAR(data, '$[0]') as address_ss58,
      CAST(JSON_EXTRACT_SCALAR(data, '$[1]') as INT) as para_id,
     -- CAST(JSON_EXTRACT_SCALAR(data, '$[2]') as UINT256) / POW(10, 10) as amount
      COALESCE(
        TRY(CAST(JSON_EXTRACT_SCALAR(data, '$[2]') AS DOUBLE)) / POW(10, 10) ,
        varbinary_to_uint256 (from_hex(JSON_EXTRACT_SCALAR(data, '$[2]')))  / POW(10, 10)
      ) as amount
      -- event_id
    FROM
      polkadot.events
      LEFT JOIN dune.substrate.result_polkadot_active_holder ah on JSON_EXTRACT_SCALAR(data, '$[0]') = ah.address_ss58
    where
      section = 'crowdloan'
      AND method = 'Contributed'
      and ah.balance > 0
      AND block_time >= DATE('2022-03-05')
      AND block_time <= DATE('2024-03-29')
  )
select
  address_ss58,
  sum(amount) as total_contribution,
  count(*) cnt
from
  crowdloadn
group by address_ss58
```

## Criteria 2: User is staking DOT (solo or nomination pool) on 3/29/24 [era 1396]

* [query_3605720](https://dune.com/queries/3605720) 
```
-- snapshot era 1396
WITH
  system_account_list as (
    SELECT DISTINCT
      address_ss58
    FROM
      query_3546915
  ),
  
    np as (
    SELECT
      address_ss58,
      max(ts) as ts,
      sum(member_bonded) as staking_amount_poolmember
    FROM
      dune.substrate.result_polkadot_poolmembers
    WHERE
      era = 1396
      AND address_ss58 NOT IN (
        select
          *
        from
          system_account_list
      ) --remove 0000000 system account
    group by
      1
  ),
  n as (
    SELECt
      nominator as address_ss58,
      max(ts) ts,
      sum(delegated_amount) as staking_amount_nominator,
      count(*) active_nomination_cnt
    FROM
      dune.substrate.result_polkadot_nominators
    WHERE
      era = 1396
      AND nominator NOT IN (
        select
          *
        from
          system_account_list
      ) --remove 0000000 system account
    group by
      1
  ),
  result as (
    SELECT
      COALESCE(n.ts, np.ts) as ts,
      COALESCE(n.address_ss58, np.address_ss58) as address_ss58,
      n.staking_amount_nominator as staking_amount_nominator,
      np.staking_amount_poolmember as staking_amount_poolmember,
      COALESCE(
        (
          COALESCE(n.staking_amount_nominator, 0) + COALESCE(np.staking_amount_poolmember, 0)
        ),
        0
      ) as staking_amount_total
    FROM
      n
      FULL join np on n.address_ss58 = np.address_ss58
  )
SELECT
  result.ts,
  result.address_ss58,
  result.staking_amount_nominator,
  result.staking_amount_poolmember,
  result.staking_amount_total,
  ah.balance
FROM
  result LEFT JOIN dune.substrate.result_polkadot_active_holder ah on result.address_ss58 = ah.address_ss58
WHERE 
  staking_amount_total > 0
  and ah.balance > 0
  
```


## Criteria 3: User has compounded or staked additional funds between 10/1/23-3/29/24

* [query_3605729](https://dune.com/queries/3605729) 
```
-- Range 2023-10-01(era 1217) vs 2024-03-29(era 1396)
WITH
  system_account_list as (
    SELECT DISTINCT
      address_ss58
    FROM
      query_3546915
  ),
  np_180 as (
    SELECT
      address_ss58,
      max(ts) as ts,
      sum(member_bonded) as staking_amount_poolmember
    FROM
      dune.substrate.result_polkadot_poolmembers
    WHERE
      DATE(ts) = (DATE('2024-03-29') - INTERVAL '180' DAY)
      AND address_ss58 NOT IN (
        select
          *
        from
          system_account_list
      ) --remove 0000000 system account
    group by
      1
  ),
  n_180 as (
    SELECt
      nominator as address_ss58,
      max(ts) ts,
      sum(delegated_amount) as staking_amount_nominator,
      count(*) active_nomination_cnt
    FROM
      dune.substrate.result_polkadot_nominators
    WHERE
      DATE(ts) = (DATE('2024-03-29') - INTERVAL '180' DAY)
      AND nominator NOT IN (
        select
          *
        from
          system_account_list
      ) --remove 0000000 system account
    group by
      1
  ),
  result_180 as (
    SELECT
      COALESCE(n_180.ts, np_180.ts) as ts_180,
      COALESCE(n_180.address_ss58, np_180.address_ss58) as address_ss58_180,
      n_180.staking_amount_nominator as staking_amount_nominator_180,
      np_180.staking_amount_poolmember as staking_amount_poolmember_180,
      COALESCE(
        (
          COALESCE(n_180.staking_amount_nominator, 0) + COALESCE(np_180.staking_amount_poolmember, 0)
        ),
        0
      ) as staking_amount_total_180,
      n_180.active_nomination_cnt as active_nomination_cnt_180
    FROM
      n_180
      FULL join np_180 on n_180.address_ss58 = np_180.address_ss58
  ),
  np as (
    SELECT
      address_ss58,
      max(ts) ts,
      sum(member_bonded) as staking_amount_poolmember
    FROM
      dune.substrate.result_polkadot_poolmembers
    WHERE
      DATE(ts) = DATE('2024-03-29')
      AND address_ss58 NOT IN (
        select
          *
        from
          system_account_list
      ) --remove 0000000 system account
    group by
      1
  ),
  n as (
    SELECt
      nominator as address_ss58,
      max(ts) ts,
      sum(delegated_amount) as staking_amount_nominator,
      count(*) active_nomination_cnt
    FROM
      dune.substrate.result_polkadot_nominators
    WHERE
      DATE(ts) = DATE('2024-03-29')
      AND nominator NOT IN (
        select
          *
        from
          system_account_list
      ) --remove 0000000 system account
    group by
      1
  ),
  result as (
    SELECT
      COALESCE(n.ts, np.ts) as ts,
      COALESCE(n.address_ss58, np.address_ss58) as address_ss58,
      n.staking_amount_nominator as staking_amount_nominator,
      np.staking_amount_poolmember as staking_amount_poolmember,
      COALESCE(
        (
          COALESCE(n.staking_amount_nominator, 0) + COALESCE(np.staking_amount_poolmember, 0)
        ),
        0
      ) as staking_amount_total,
      n.active_nomination_cnt
    FROM
      n
      FULL join np on n.address_ss58 = np.address_ss58
  ),
  diff as (
    SELECT
      *
    FROM
      (
        SELECT
          result.*,
          result_180.*,
          result.staking_amount_total - result_180.staking_amount_total_180 as net_change
        FROM
          result
          FULL join result_180 on result.address_ss58 = result_180.address_ss58_180
        WHERE
          result.staking_amount_total - result_180.staking_amount_total_180 > 0
        
      )
  ),
  final_res as (
    SELECT
      diff.*,
      ah.balance
    FROM
      diff
      LEFT JOIN dune.substrate.result_polkadot_active_holder ah on diff.address_ss58 = ah.address_ss58
      WHERE ah.balance > 0.001
      ORDER BY net_change desc 
  )
  select * from final_res
```

## Criteria 4: User has voted in OpenGov refs starting/finishing between 10/1/23-3/29/24

Previous methodology:  [query_3605789](https://dune.com/queries/3605789) based on "User has voted in governance in the last 180 days is listed below" 
revised to: New methodology (suggested by Ollie @ Parity Data): Get the final blocks of each referendum that started or finished between October 01 2023 - March 29 2024 by calling Referenda.ReferendumInfoFor storage function, and then for each referendum and respective final block - 1, make the call to ConvictionVoting.VotingFor storage function and parse all the votes for the referendum in question. Count number of distinct addresses.
```
select address_ss58 from dune.substrate.dataset_mythos_airdrop_criteria4
```

The above table was built from `end_hash` list from
https://dune.com/queries/3940588
incorporated in a script of:
```
  

async  criteria4() {
 let wsEndpoint = 'wss://rpc.polkadot.io';
 var provider = new  WsProvider(wsEndpoint);
 const api = await ApiPromise.create({provider});
 let block_hashes = [
"0x2af46df28eaaf8b59dd497ee941c0278d6a29ff3243b5f7370461e0f8b2c1731" ...];
 for ( const  block_hash of block_hashes ) {
  let apiAt = await api.at(block_hash)
  let votes = await  this.paginated_fetch(apiAt, 'convictionVoting.votingFor');
  for (const  vote of votes) {
    let voteK = vote[0].toHuman()
    let voter = voteK[0]
    console.log(`CRITERIA4,${voter},${block_hash}`);
   }
 }
}
```

## Criteria 5: User has participated in a crowdloan before 3/29/24

* [`query_3605750`](https://dune.com/queries/3605750) 
```
SELECT DISTINCT
  JSON_EXTRACT_SCALAR(data, '$[0]') as address_ss58
FROM
  polkadot.events LEFT JOIN dune.substrate.result_polkadot_active_holder ah on JSON_EXTRACT_SCALAR(data, '$[0]') = ah.address_ss58
WHERE
  section = 'crowdloan'
  AND method = 'Contributed'
  AND ah.balance > 0
  AND block_number <= 20109444
  AND block_time <= TIMESTAMP '2024-03-29 11:00:30 UTC'
```

## Criteria 6: User has participated in a crowdloan between 10/1/23-3/29/24

* [`query_3605764`](https://dune.com/queries/3605764) 
```
SELECT DISTINCT
  JSON_EXTRACT_SCALAR(data, '$[0]') as address_ss58
FROM
  polkadot.events LEFT JOIN dune.substrate.result_polkadot_active_holder ah on JSON_EXTRACT_SCALAR(data, '$[0]') = ah.address_ss58
WHERE
  section = 'crowdloan'
  AND method = 'Contributed'
  AND ah.balance > 0
  AND block_number <= 20109444
  AND block_time <= TIMESTAMP '2024-03-29 11:00:30 UTC'
  AND block_time > date_add('day', -180, TIMESTAMP '2024-03-29 11:00:30 UTC')
```

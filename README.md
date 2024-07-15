# Mythos Airdrop Data Sources

This has all the queries used for [OpenGov Ref #643 - Mythos airdrop](https://dune.com/substrate/mythos) "Active Users" compiled here in [this sheet](
https://docs.google.com/spreadsheets/d/1mUdxtK13Px2k2-YbIcQtbzY_HYadI0pqqxLVfyF3u7Y/edit?gid=57968099#gid=57968099).

It has been compiled by [Colorful Notion](https://t.me/colorfulnotion), catalyst for Polkadot Dune dashboards via [OpenGov Ref #366](https://polkadot.polkassembly.io/referenda/366) (see [Polkadot wiki](https://wiki.polkadot.network/docs/general/polkadot-ecosystem-overview) ) and Developer of [Dotswap.org](https://dotswap.org) which will support MYTH trading on Polkadot Asset Hub -- see [OpenGov Ref #988](https://polkadot.polkassembly.io/referenda/988).   

Key Contacts: @sourabhniyogi (Colorful Notion) + @mnafta (Scytale)

## Active Users Query

[Mythos distribution to Active Users](https://dune.com/queries/3605813/6075513)

```
--[dataset_xcmtransfers]	Criteria 1.0 - User has executed xcm transfer in the last 180 days
--[dataset_xcmtransfers]	Criteria 1.1 - Include XCM Transfers between AssetHub, Moonbeam, Astar, HydraDX
--[dataset_xcmtransfers]	Criteria 1.2 - 10 or more xcm transfers in the last 180 days
--[query_3605720]  	Criteria 2 - User is staking DOT (solo or nomination pool)
--[query_3605729] 	Criteria 3 - User has compounded or staked additional funds in the last 180 days
--[query_3605789] 	Criteria 4 - User has voted in governance in the last 180 days
--[query_3605750] 	Criteria 5 - User has participated in a crowdloan
--[query_3605764] 	Criteria 6 - User has participated in a crowdloan in last 180 days
with s as (
    select 
        address_ss58, CAST(total AS UINT256)/POW(10,10) as total
    from 
        dune.substrate.dataset_mythos_snapshot 
),
xs as (
    select 
        s.address_ss58, s.total as snapshot, coalesce(nompool_total, 0) nompool, s.total + coalesce(nompool_total, 0) as total
    from 
        s left join query_3642228 on s.address_ss58 = query_3642228.address_ss58
),
x as (
    select 
        xs.address_ss58, xs.snapshot, xs.nompool, coalesce(total_contribution, 0) crowdloan,  xs.total + coalesce(total_contribution, 0) as total
    from 
        xs left join query_3642291 on xs.address_ss58 = query_3642291.address_ss58
),
xcmcnt as (
  select  from_ss58, count(*) cnt from dune.substrate.dataset_xcmtransfers where ts >= 1696118400 and ts <= 1711756800 group by 1
), 
indicators as (
select address_ss58, 0 as criteria1, 0 as criteria11, 0 as criteria12, 0 as criteria2, 0 as criteria3, 0 as criteria4, 0 as criteria5, 0 as criteria6, snapshot, crowdloan, nompool, total 
 from x where total >= 10 and total < 5000
union all
select address_ss58, 1 as criteria1, 0 as criteria11, 0 as criteria12, 0 as criteria2, 0 as criteria3, 0 as criteria4, 0 as criteria5, 0 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total
 from x where total >= 10 and total < 5000 and
   address_ss58 in (select distinct from_ss58 as address_ss58 from dune.substrate.dataset_xcmtransfers where ts >= 1696118400 and ts <= 1711756800) 
union all 
select address_ss58, 0 as criteria1, 1 as criteria11, 0 as criteria12, 0 as criteria2, 0 as criteria3, 0 as criteria4, 0 as criteria5, 0 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total 
 from x where total >= 10 and total < 5000 and
   address_ss58 in (select  distinct from_ss58 from dune.substrate.dataset_xcmtransfers  where src_chain_id  in (2004,1000,2006,2034) and dest_chain_id  in (2004,1000,2006,2034) ) 
union all 
select address_ss58, 0 as criteria1, 0 as criteria11, 1 as criteria12,  0 as criteria2, 0 as criteria3, 0 as criteria4, 0 as criteria5, 0 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total
 from x where total >= 10 and total < 5000 and
 ( address_ss58 in (select from_ss58 from xcmcnt  where cnt >= 10) ) 
union all 
select address_ss58, 0 as criteria1, 0 as criteria11, 0 as criteria12, 1 as criteria2, 0 as criteria3, 0 as criteria4, 0 as criteria5, 0 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total
 from x where total >= 10 and total < 5000 and
   address_ss58 in (select address_ss58 from query_3605720) -- Criteria_2 dataset_polkadot_recent_staker
union all 
select address_ss58, 0 as criteria1, 0 as criteria11, 0 as criteria12, 0 as criteria2, 1 as criteria3, 0 as criteria4, 0 as criteria5, 0 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total
 from x where total >= 10 and total < 5000 and
   address_ss58 in (select address_ss58 from query_3605729) -- Criteria_3 dataset_polkadot_recent_staked_additional_funds
union all 
select address_ss58, 0 as criteria1, 0 as criteria11, 0 as criteria12,  0 as criteria2, 0 as criteria3, 1 as criteria4, 0 as criteria5, 0 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total
 from x where total >= 10 and total < 5000 and
  address_ss58 in (select address_ss58 from query_3605789) -- Criteria_4 dataset_polkadot_voters_last_6mo
union all 
select address_ss58, 0 as criteria1, 0 as criteria11, 0 as criteria12, 0 as criteria2, 0 as criteria3, 0 as criteria4, 1 as criteria5, 0 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total
from x where total >= 10 and total < 5000 and
   address_ss58 in (select address_ss58 from query_3605750) -- Criteria_5 dataset_polkadot_participated_crowdloan
union all 
select address_ss58, 0 as criteria1, 0 as criteria11, 0 as criteria12,  0 as criteria2, 0 as criteria3, 0 as criteria4, 0 as criteria5, 1 as criteria6, 0 as snapshot, 0 as crowdloan, 0 as nompool, 0 as total
from x where total >= 10 and total < 5000 and
  address_ss58 in (select address_ss58 from query_3605764) -- Criteria_6 dataset_polkadot_participated_crowdloan_last_180
)
select address_ss58, 
 38.76134*sum(criteria1) + 104.17110*sum(criteria11)  + 871.96335*sum(criteria12)  + 
 16.99162*sum(criteria2)  + 28.12458*sum(criteria3)   + 181.42427*sum(criteria4)  +
 18.14259*sum(criteria5)  + 77.47412*sum(criteria6) as airdrop_amount,
 sum(total) as total_dot,
 sum(snapshot) as snapshot_dot,
 sum(nompool) as nompool_dot,
 sum(crowdloan) as crowdloan_dot,
 sum(criteria1 + criteria11 + criteria12 + criteria2 + criteria3 + criteria4 +  criteria5 + criteria6) num_criteria,
 sum(criteria1) as criteria1,
 sum(criteria11) as criteria11,
 sum(criteria12) as criteria12,
 sum(criteria2) as criteria2,
 sum(criteria3) as criteria3,
 sum(criteria4) as criteria4,
 sum(criteria5) as criteria5,
 sum(criteria6) as criteria6
 from indicators  group by 1 having sum(criteria1 + criteria11 + criteria12 + criteria2 + criteria3 + criteria4 +  criteria5 + criteria6) > 0
 order by airdrop_amount desc
```

Notes concerning the above query:
* source balance snapshot data is from `dataset_mythos_snapshot`  was obtained from Ramsey @ Decentration (who did the DED snapshot) but further extended based on community requests to include:
	*  nomination pools [`query_3642228`](https://dune.com/queries/3642228) and 
	*  crowdloan contributions [`query_3642291`](https://dune.com/queries/3642291) 
	(see Balances Info)
* `dataset_xcmtransfers` is used for 
	* Criteria 1.0 - User has executed xcm transfer in the last 180 days
	* Criteria 1.1 - Include XCM Transfers between AssetHub, Moonbeam, Astar, HydraDX
    * Criteria 1.2 - 10 or more xcm transfers in the last 180 days
* [`query_3605720`](https://dune.com/queries/3605720) Criteria 2 - User is staking DOT (solo or nomination pool) is listed below 
* [`query_3605729`](https://dune.com/queries/3605729) Criteria 3 - User has compounded or staked additional funds in the last 180 days is listed below
* [`query_3605789`](https://dune.com/queries/3605789) Criteria 4 - User has voted in governance in the last 180 days is listed below
* [`query_3605750`](https://dune.com/queries/3605750) Criteria 5 - User has participated in a crowdloan is listed below
* [`query_3605764`](https://dune.com/queries/3605764) Criteria 6 - User has participated in a crowdloan in last 180 days is listed below

* Each of the above criteria is put into one of 8 "indicator" attributes (0 or 1)  `criteria1` ... `criteria6`  with the `airdrop_amount`  based on the weighted combination of these
```38.76134*sum(criteria1) + 104.17110*sum(criteria11)  + 871.96335*sum(criteria12)  + 
 16.99162*sum(criteria2)  + 28.12458*sum(criteria3)   + 181.42427*sum(criteria4)  +
 18.14259*sum(criteria5)  + 77.47412*sum(criteria6) as airdrop_amount
```
These weights were determined here, and developed by Michael Naftaliev and Sourabh Niyogi 

* `ts >= 1696118400 and ts <= 1711756800` covers 2023-10-01 00:00:00 until 2024-03-29 23:59:59
* `(DATE('2024-03-29') - INTERVAL '180' DAY)` matches the above
 
## Balances Info:
 
* ```dune.substrate.dataset_mythos_snapshot``` provided by Ramsey of Decentration, uploaded manually as a CSV file, believed to be approximately 2024-03-29 11:00 UTC.

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
  )
select
  address_ss58,
  sum(amount) as total_contribution,
  count(*) cnt
from
  crowdloadn
group by address_ss58
```

## Criteria 2: User is staking DOT (solo or nomination pool)

* [query_3605720](https://dune.com/queries/3605720) 
```
WITH
  rank_data_n_p as (
    SELECT DISTINCT
      ts,
      address_ss58,
      member_bonded as staking_amount,
      ROW_NUMBER() OVER (
        PARTITION BY
          address_ss58
        ORDER BY
          ts DESC
      ) as rn
    FROM
      dune.substrate.result_polkadot_poolmembers
    WHERE
      address_ss58 NOT iN (
        SELECT DISTINCT
          address_ss58
        FROM
          query_3546915
      )
  ),
  np as (
    SELECt DISTINCT
      ts,
      address_ss58,
      staking_amount as staking_amount_poolmember
    FROM
      rank_data_n_p
    WHERE
      rn = 1
  ),
  rank_data_n as (
    SELECt DISTINCT
      ts,
      nominator,
      delegated_amount as staking_amount,
      ROW_NUMBER() OVER (
        PARTITION BY
          nominator
        ORDER BY
          ts DESC
      ) as rn
    FROM
      dune.substrate.result_polkadot_nominators
    WHERE
      nominator NOT iN (
        SELECT DISTINCT
          address_ss58
        FROM
          query_3546915
      )
  ),
  n as (
    SELECt DISTINCT
      ts,
      nominator as address_ss58,
      staking_amount as staking_amount_nominator
    FROM
      rank_data_n
    WHERE
      rn = 1
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


## Criteria 3: User has compounded or staked additional funds in the last 180 days

* [query_3605729](https://dune.com/queries/3605729) 
```
WITH
  rank_data_n_p_180 as (
    SELECT DISTINCT
      ts,
      address_ss58,
      member_bonded as staking_amount,
      ROW_NUMBER() OVER (
        PARTITION BY
          address_ss58
        ORDER BY
          ts DESC
      ) as rn
    FROM
      dune.substrate.result_polkadot_poolmembers
    WHERE
      ts <= (DATE('2024-03-29') - INTERVAL '180' DAY)
      and address_ss58 NOT iN (
        SELECT DISTINCT
          address_ss58
        FROM
          query_3546915
      ) --remove 0000000 system account
  ),
  np_180 as (
    SELECt DISTINCT
      ts,
      address_ss58,
      staking_amount as staking_amount_poolmember
    FROM
      rank_data_n_p_180
    WHERE
      rn = 1
  ),
  rank_data_n_180 as (
    SELECt DISTINCT
      ts,
      nominator,
      delegated_amount as staking_amount,
      ROW_NUMBER() OVER (
        PARTITION BY
          nominator
        ORDER BY
          ts DESC
      ) as rn
    FROM
      dune.substrate.result_polkadot_nominators
    WHERE
      ts <= (DATE('2024-03-29') - INTERVAL '180' DAY)
      and nominator NOT iN (
        SELECT DISTINCT
          address_ss58
        FROM
          query_3546915
      ) --remove 0000000 system account
  ),
  n_180 as (
    SELECt DISTINCT
      ts,
      nominator as address_ss58,
      staking_amount as staking_amount_nominator
    FROM
      rank_data_n_180
    WHERE
      rn = 1
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
      ) as staking_amount_total_180
    FROM
      n_180
      FULL join np_180 on n_180.address_ss58 = np_180.address_ss58
  ),
  rank_data_n_p as (
    SELECT DISTINCT
      ts,
      address_ss58,
      member_bonded as staking_amount,
      ROW_NUMBER() OVER (
        PARTITION BY
          address_ss58
        ORDER BY
          ts DESC
      ) as rn
    FROM
      dune.substrate.result_polkadot_poolmembers
    WHERE
      address_ss58 NOT iN (
        SELECT DISTINCT
          address_ss58
        FROM
          query_3546915
      ) --remove 0000000 system account
  ),
  np as (
    SELECt DISTINCT
      ts,
      address_ss58,
      staking_amount as staking_amount_poolmember
    FROM
      rank_data_n_p
    WHERE
      rn = 1
  ),
  rank_data_n as (
    SELECt DISTINCT
      ts,
      nominator,
      delegated_amount as staking_amount,
      ROW_NUMBER() OVER (
        PARTITION BY
          nominator
        ORDER BY
          ts DESC
      ) as rn
    FROM
      dune.substrate.result_polkadot_nominators
    WHERE
      nominator NOT iN (
        SELECT DISTINCT
          address_ss58
        FROM
          query_3546915
      ) --remove 0000000 system account
  ),
  n as (
    SELECt DISTINCT
      ts,
      nominator as address_ss58,
      staking_amount as staking_amount_nominator
    FROM
      rank_data_n
    WHERE
      rn = 1
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
  ),
  diff as (
    SELECT
      *
    FROM
      (
        SELECT
          result.*,
          result_180.*,
          result.staking_amount_total - result_180.staking_amount_total_180 as diff
        FROM
          result
          FULL join result_180 on result.address_ss58 = result_180.address_ss58_180
        WHERE
          result.staking_amount_total - result_180.staking_amount_total_180 > 0
      )
  )
SELECT
  diff.*,
  ah.balance
FROM
  diff
  LEFT JOIN dune.substrate.result_polkadot_active_holder ah on diff.address_ss58 = ah.address_ss58
WHERE
  ah.balance > 0
```

## Criteria 4 - User has voted in governance in the last 180 days is listed below

* [query_3605789](https://dune.com/queries/3605789) 
```
WITH
  vote as (
    SELECT DISTINCT
      vr.address_ss58
    FROM
      dune.substrate.result_polkadot_vote_record_from_traces as vr
    WHERE
      vr.ts >= DATE('2024-03-29') - INTERVAL '180' day
      AND vr.total_delegate_token = 0
  )
SELECT DISTINCT
  vote.*,
  ah.balance
FROM
  vote
  LEFT JOIN dune.substrate.result_polkadot_active_holder ah on vote.address_ss58 = ah.address_ss58
WHERE
  ah.balance > 0
```

## Criteria 5 - User has participated in a crowdloan is listed below

* [`query_3605750`](https://dune.com/queries/3605750) 
```
SELECT DISTINCT
  JSON_EXTRACT_SCALAR(data, '$[0]') as address_ss58
FROM
  polkadot.events LEFT JOIN dune.substrate.result_polkadot_active_holder ah 
   on JSON_EXTRACT_SCALAR(data, '$[0]') = ah.address_ss58
where
  section = 'crowdloan'
  AND method = 'Contributed'
  and ah.balance > 0
```

## Criteria 6 - User has participated in a crowdloan in last 180 days is listed below

* [`query_3605764`](https://dune.com/queries/3605764) 
```
SELECT DISTINCT
  JSON_EXTRACT_SCALAR(data, '$[0]') as address_ss58
FROM
  polkadot.events LEFT JOIN dune.substrate.result_polkadot_active_holder ah 
   on JSON_EXTRACT_SCALAR(data, '$[0]') = ah.address_ss58
where
  section = 'crowdloan'
  AND method = 'Contributed'
  and ah.balance > 0
  AND block_time >= (DATE('2024-03-29') - INTERVAL '180' DAY)
```


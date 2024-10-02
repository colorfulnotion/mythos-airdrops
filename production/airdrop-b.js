const {
    ApiPromise,
    WsProvider,
    Keyring
} = require('@polkadot/api');
const {
    cryptoWaitReady
} = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Function to read CSV file asynchronously
async function readCsvFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
    const api = await ApiPromise.create({
        provider: wsProvider
    });
    await cryptoWaitReady();

    // Load the target addresses and amounts from CSV file mythos-airdrop-b${group}.csv
    let group = process.argv[2]; // e.g. "16"
    let activesData = await readCsvFile(`mythos-airdrop-b${group}.csv`);
    console.log(`${group} Read ${activesData.length} active addresses`)
    // sort in ascending order
    activesData = activesData.sort((a, b) => a.airdrop_amount - b.airdrop_amount);

    var transfersData = [];
    for (const active of activesData) {
        transfersData.push(active);
    }
    console.log(`TOTAL: ${transfersData.length} addresses`)

    // Define maximum number of calls in a single batch
    const MAX_CALLS_PER_BATCH = 383;

    // Split transfers into multiple batches
    const airdrop = '643';
    const batches = [];
    let asset = {
        parents: 1,
        interior: {
            X1: {
                parachain: 3369
            }
        }
    }

    // write batches
    let batchAmount = {};
    let batchCount = {};
    for (let i = 0, batch = 0; i < transfersData.length; i += MAX_CALLS_PER_BATCH, batch++) {
        let totalAmount = 0.0;
        const batchCalls = transfersData.slice(i, i + MAX_CALLS_PER_BATCH).map(({
            address_ss58,
            airdrop_amount
        }) => {
	    console.log(`${airdrop_amount}`);
            totalAmount += Math.round(airdrop_amount / 10**18);
            return api.tx.foreignAssets.transfer(asset, address_ss58, `${airdrop_amount}`);
        });
        batches.push(api.tx.utility.batch(batchCalls));
        batchAmount[batch] = Math.round(totalAmount);
        batchCount[batch] = batchCalls.length;
    }
    let grouptally = {};
    let groupcount = {};
    for (let i = 0; i < batches.length; i++) {
        const batchIndexHex = `${i.toString(16).padStart(4, '0')}`;
        const batch = batches[i];

        // get callHash and data
        const callHash = batch.method.hash.toHex();
        const callData = batch.method.toHex();

        // Write callData to file fn
        let groupdir = path.join(airdrop, `b${group}`);
        if (grouptally[group] == undefined) {
            grouptally[group] = batchAmount[i];
            groupcount[group] = batchCount[i];
            fs.mkdirSync(groupdir, {
                recursive: true
            });
        } else {
            grouptally[group] += batchAmount[i];
            groupcount[group] += batchCount[i];
        }
        let fn = path.join(groupdir, `${batchIndexHex}-${callHash}-${batchAmount[i]}-${batchCount[i]}.txt`);
        fs.writeFileSync(fn, callData);
        console.log(`Wrote ${fn} (${i}/${batches.length}): ${batchAmount[i]} MYTH with ${batchCount[i]} addresses`);
        if (i == batches.length - 1) {
            console.log(`GROUP ${group}: ${grouptally[group]} MYTH to ${groupcount[group]} addresses`);
        }
    }

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

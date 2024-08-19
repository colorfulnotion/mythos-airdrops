const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const fs = require('fs');
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
    const api = await ApiPromise.create({ provider: wsProvider });
    await cryptoWaitReady();

    // Load the target addresses and amounts from CSV
    const transfersData = await readCsvFile('mythos-airdrop-v4-activeusers-20240818.csv');
    const inactivesData = await readCsvFile('mythos-airdrop-v4-inactiveusers-20240818.csv');
    console.log(`Read ${transfersData.length} active addresses`)
    console.log(`Read ${inactivesData.length} inactive addresses`)

    const inactiveAmount = '11500000000000000000';   
    for ( const inactive of inactivesData ) {
	transfersData.push({ address_ss58: inactive.address_ss58, airdrop_amount: inactiveAmount })
    }
    console.log(`TOTAL: ${transfersData.length} addresses`)
    
    // Define maximum number of calls in a single batch
    const MAX_CALLS_PER_BATCH = 383;

    // Additional transfer amount and address
    const additionalTransferAddress = '158HZgF63Z5oTUkJ5pDD7s7byafb1nSx1S3UBHYKakjPXMxw';
    const additionalTransferAmount = '201'; 
    const decimalString = '000000000000000000'; // 18 zeroes for MYTH
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
    for (let i = 0, batch = 0 ; i < transfersData.length; i += MAX_CALLS_PER_BATCH, batch++) {
	let totalAmount = 0.0;
	const batchCalls = transfersData.slice(i, i + MAX_CALLS_PER_BATCH).map(({ address_ss58, airdrop_amount }) => {
	    if ( airdrop_amount == inactiveAmount ) {
		totalAmount += 11.5;
		return api.tx.foreignAssets.transfer(asset, address_ss58, inactiveAmount);
	    } else {
		totalAmount += Math.round(airdrop_amount);
		return api.tx.foreignAssets.transfer(asset, address_ss58, `${airdrop_amount}${decimalString}`);
	    }
	});
        if ( additionalTransferAmount < 202 ) { // safety
	    batchCalls.push(api.tx.foreignAssets.transfer(asset, additionalTransferAddress, `${additionalTransferAmount}${decimalString}`));
	    totalAmount += Math.round(additionalTransferAmount);
	    const batchIndexHex = `${batch.toString(16).padStart(4, '0')}`;
            batchCalls.push(api.tx.system.remark(`${batchIndexHex}:${totalAmount}`));
	}
        batches.push(api.tx.utility.batch(batchCalls));
	batchAmount[batch] = totalAmount;
    }

    for (let i = 0; i < batches.length; i++) {
	const batchIndexHex = `${i.toString(16).padStart(4, '0')}`;
        const batch = batches[i];

        // get callHash and data
        const callHash = batch.method.hash.toHex();
        const callData = batch.method.toHex();

        // Write callData to file fn
	let fn = `${airdrop}/${batchIndexHex}-${callHash}.txt`
        fs.writeFileSync(fn, callData);
	console.log(`Wrote ${fn} (${i}/${batches.length}): ${batchAmount[i]}`);
    }

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

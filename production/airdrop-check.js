const { ApiPromise, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');

async function readBatchFiles(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(`Unable to scan directory: ${err}`);
                return;
            }

            const batchCalls = [];
            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                const rawHexData = fs.readFileSync(filePath, 'utf-8').trim();
                batchCalls.push(rawHexData); // Store raw hex data
            }
            resolve(batchCalls);
        });
    });
}

async function getDotBalance(api, address) {
    try {
        const { data: balance } = await api.query.system.account(address);
        return balance.free.toBigInt();
    } catch (error) {
        console.error(`Error fetching DOT balance for ${address}:`, error);
        return BigInt(0);
    }
}

async function getAssetBalance(api, asset, address) {
    try {
        const balance = await api.query.foreignAssets.account(asset, address);
        return balance.toBigInt();
    } catch (error) {
        console.error(`Error fetching asset balance for ${address}:`, error);
        return BigInt(0);
    }
}

async function decodeBatchAndCheckBalances(api, asset, batchCalls) {
    for (const rawHexCall of batchCalls) {
        const call = api.createType('Call', rawHexCall); // Decode raw hex into a Call object

        if (call.section === 'foreignAssets' && call.method === 'transfer') {
            const { args } = call.toJSON();
            const address = args[1];
            const transferAmount = BigInt(args[2]);

            // (1) Get DOT balance from system.account
            const dotBalance = await getDotBalance(api, address);
            if (dotBalance === BigInt(0)) {
                console.log("ED:", address);
            }

            // (2) Get asset balance from foreignAssets.balanceOf
            const assetBalance = await getAssetBalance(api, asset, address);
            if (assetBalance < transferAmount) {
                console.log(`MYTH:${address}:${assetBalance.toString()}:${transferAmount.toString()}`);
            }
        }
    }
}

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    await cryptoWaitReady();

    // Read the raw hex call data from the files in the 643/b1 (or whatever) directory
    const airdrop = '643'; // Base directory for airdrop calls grouped into folders by batches
    const batchNumber = `b1`;
    const batchDir = path.join(airdrop, `${batchNumber}`);

    const batchCalls = await readBatchFiles(batchDir);
    if (batchCalls.length === 0) {
        console.log(`No call data found in ${batchDir}`);
        return;
    }

    // Asset definition
    const asset = {
        parents: 1,
        interior: {
            X1: {
                parachain: 3369
            }
        }
    };

    // Decode and check balances for each call in the batch
    await decodeBatchAndCheckBalances(api, asset, batchCalls);

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

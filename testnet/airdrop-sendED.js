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

const wallet1Mnemonic = fs.readFileSync(`${process.env.HOME}/.wallet1`, 'utf-8').trim(); // A
const filePath = path.join(__dirname, 'addresses.txt'); // Replace with the correct file path
const dotAmount = '100000000'; // 0.01 DOT (10^10 Plancks)
const MAX_BATCH_SIZE = 383; // Maximum number of transfers per batch

async function readAddressFile(filePath) {
    return new Promise((resolve, reject) => {
        const addresses = [];
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(`Error reading file: ${err}`);
                return;
            }
            const lines = data.trim().split('\n');
            lines.forEach(line => {
                const sa = line.split(':');
                let address = sa[0];
                let dotResult = sa[2];
                if (dotResult == "NEEDED") {
                    addresses.push(address);
                }
            });
            resolve(addresses);
        });
    });
}

async function getDotBalance(api, address) {
    try {
        let query = await api.query.system.account(address);
        let x = query.toJSON();
        let free = x.data.free;
        return free;
    } catch (error) {
        console.error(`Error fetching DOT balance for ${address}:`, error);
        return 0;
    }
}

function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://asset-hub-polkadot-rpc.dwellir.com');
    const api = await ApiPromise.create({
        provider: wsProvider
    });
    await cryptoWaitReady();

    // Initialize keyring and add accounts
    const keyring = new Keyring({
        type: 'sr25519'
    });
    const wallet1 = keyring.addFromMnemonic(wallet1Mnemonic);

    // Read addresses from the file
    const addresses = await readAddressFile(filePath);
    console.log(`Found ${addresses.length} addresses`);

    // Split addresses into batches of MAX_BATCH_SIZE
    const addressChunks = chunkArray(addresses, MAX_BATCH_SIZE);

    for (let i = 0; i < addressChunks.length; i++) {
        const chunk = addressChunks[i];
        console.log(`Processing batch ${i + 1}/${addressChunks.length} with ${chunk.length} addresses`);

        const transfers = [];
        for (let address of chunk) {
            const balance = await getDotBalance(api, address);
            if (balance === 0) {
                console.log(`Adding address ${address} with 0 balance to batch`);
                transfers.push(api.tx.balances.transferAllowDeath(address, dotAmount));
            } else {
                console.log(`Skipping address ${address} with non-zero balance: ${balance}`);
            }
        }

        if (transfers.length > 0) {
            // Create a single batch transaction
            const batch = api.tx.utility.batch(transfers);
            console.log("READY", transfers.length)
            // Sign and send the transaction
            const txHash = await batch.signAndSend(wallet1);
            console.log(`Batch ${i + 1} sent with hash: ${txHash}`);

        } else {
            console.log(`Batch ${i + 1} has no valid transfers to send.`);
        }
    }

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);
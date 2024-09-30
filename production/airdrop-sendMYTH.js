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

const wallet1Mnemonic = fs.readFileSync(`${require('os').homedir()}/.wallet1`, 'utf-8').trim(); // CN
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

    const address_ss58 = process.argv[2];
    if (address_ss58 == undefined) {
        console.log("Need recipient")
        process.exit(1);
    }

    let asset = {
        parents: 1,
        interior: {
            X1: {
                parachain: 3369
            }
        }
    }

    // Sign and send the transaction
    let amt = '1234567890123456789'; // 1.234 MYTH (divide by 10^18)
    let approve = api.tx.foreignAssets.transfer(asset, address_ss58, amt);
    const txHash = await approve.signAndSend(wallet1);
    console.log(`MYTH sent with hash: ${txHash}`);
    // WAIT for tx to be included in block
    await new Promise((resolve, reject) => {
	const unsubscribe = api.rpc.chain.subscribeNewHeads(async (header) => {
            try {
		// Fetch the block details
		const blockHash = header.hash;
		const signedBlock = await api.rpc.chain.getBlock(blockHash);
		
		// Check if the transaction is included in the block
		const blockExtrinsics = signedBlock.block.extrinsics;
		
                let found = false;
		blockExtrinsics.forEach(({ method: { method, section }, hash }) => {
                    if (hash.toString() === txHash.toString()) {
			console.log(`Transaction found in block ${blockHash} ${header.number}`);
			found = true;
			resolve()
                    }
		});

                if (!found) {
                    console.log(`Transaction not yet found in block ${header.number}`);
                }
            } catch (err) {
		console.error(`Error fetching block: ${err}`);
		reject(err);
            }
	});
    });
    
    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

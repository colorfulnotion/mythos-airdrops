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

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
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
    console.log(`Found ${addresses.length} addresses`, addresses);

    // Create batch of transfer transactions (sending 0.01 DOT to each address)
    const transfers = addresses.map(address => api.tx.balances.transferAllowDeath(address, dotAmount));

    // Create a single batch transaction
    const batch = api.tx.utility.batch(transfers);
    console.log(batch.method.toHex())
    // Sign and send the transaction
    const txHash = await batch.signAndSend(wallet1);
    console.log(`Transaction sent with hash: ${txHash}`);

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

const {
    ApiPromise,
    WsProvider,
    Keyring
} = require('@polkadot/api');
const {
    cryptoWaitReady,
    blake2AsHex
} = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');

const wallet1Mnemonic = fs.readFileSync(`${process.env.HOME}/.wallet1`, 'utf-8').trim(); // CN
const wallet2Address = '12j7ydmwGoPr1WxPcYx1u34G8wxSW4vgwTCwKP6AgsPtVvH1'; // ST
const wallet3Address = '14QT3gXBmzj8ZqwtKrxGHvsyXUL1m1hcT8rqUfe78thmB29j'; // OGW
const multisigWallet = '15KHn88G2XELAMxbrkBYDmwdbgWYnrGBTPoLdV1NgHUPU6f4';

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
    const api = await ApiPromise.create({
        provider: wsProvider
    });
    await cryptoWaitReady();

for ( g = 1; g<=14; g++) {
    const group = `b${g}`;

    // Initialize keyring and add accounts
    const keyring = new Keyring({
        type: 'sr25519'
    });
    const wallet1 = keyring.addFromMnemonic(wallet1Mnemonic);
    const threshold = 2; // 2 out of 3
    // Fixed 2nd+3rd wallet address
    const otherSignatories = [wallet2Address, wallet3Address].sort();
    const airdrop = "643";

    const nonce = await api.rpc.system.accountNextIndex(wallet1.address);

    // Directory containing the .txt files
    let directoryPath = path.join(__dirname, airdrop, group);
    // Get all .txt files from the directory
    let files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.txt'));

    for (const file of files) {
        // Read file content into a string
        const filePath = path.join(directoryPath, file);
        const hexString = fs.readFileSync(filePath, 'utf-8').trim();

        // Create a call using the hex string (considering it's already encoded properly)
        const batch = api.createType('Call', hexString);
        const blake2Hash = blake2AsHex(batch.toHex());

        if (file.includes(blake2Hash)) { // CHECKS that the hash of the content of the file is in the filename
            // Retrieve the ongoing multisig timepoint if exists
            const maybeTimepoint = await api.query.multisig.multisigs(multisigWallet, blake2Hash);

            if (maybeTimepoint.isSome) {
                const timepoint = maybeTimepoint.unwrap().when;
                console.log(`${file}:${timepoint.height}:${timepoint.index}`);
            } else {
                console.log(`${file}:NOTIMEPOINT:NOTIMEPOINT`);
            }
        } else {
            console.log(`Batch ${file} HASH check failed!`);
            process.exit(0);
        }
    }
}
    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

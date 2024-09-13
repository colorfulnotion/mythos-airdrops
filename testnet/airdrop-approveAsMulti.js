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

const wallet1Mnemonic = fs.readFileSync(`${process.env.HOME}/.wallet1`, 'utf-8').trim(); // A = 13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ
const wallet2Address = '13diZnYMiakbUqdYJhgr4QkAnpFd4LVA8aAG3wUkrpkDAbw5'; // C
const wallet3Address = '121Rs6fKm8nguHnvPfG1Cq3ctFuNAVZGRmghwkJwHpKxKjbx';
const multisigWallet = '1iWqnxMygdnhvC8LkyvnQYG8SFFUoATYrgRGMkXnCdw9mHX'

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
    const api = await ApiPromise.create({
        provider: wsProvider
    });
    await cryptoWaitReady();

    const group = process.argv[2];
    if (group == undefined) {
        console.log("Need group input")
        process.exit(1);
    }
    console.log("Processing group: ", group)

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
    let files = []
    if (group.includes("0x")) {
        directoryPath = "."
        files = [group];
    } else {
        // Get all .txt files from the directory
        files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.txt'));
    }
    let nbatches = 0;
    for (const file of files) {
        // Read file content into a string
        const filePath = path.join(directoryPath, file);
        const hexString = fs.readFileSync(filePath, 'utf-8').trim();
        // Create a call using the hex string (considering it's already encoded properly)
        const batch = api.createType('Call', hexString);
        const blake2Hash = blake2AsHex(batch.toHex());
        if (file.includes(blake2Hash)) { // CHECKS that the hash of the content of the file is in the filename

            const multisigInfo = await api.query.multisig.multisigs(multisigWallet, blake2Hash);
            let timepoint = null;
            if (multisigInfo.isSome) {
                // Multisig operation is already underway, retrieve timepoint
                timepoint = multisigInfo.unwrap().when;
            }
            const info = await api.tx.utility.batch([batch]).paymentInfo(wallet1);
            const maxWeight = info.weight;

            const approve = api.tx.multisig.asMulti(
                threshold,
                otherSignatories,
                timepoint,
                batch,
                maxWeight
            );

            // Send the transaction from the first wallet
            const txHash = await approve.signAndSend(wallet1, {
                nonce: nonce.addn(nbatches)
            });

            console.log(`Batch ${nbatches}/${files.length} approveAsMulti submitted with tx hash ${txHash}`);
            nbatches++;
        } else {
            console.log(`Batch ${nbatches}/${files.length}: ${file} HASH check FAILED!`);
            process.exit(0);
        }
    }

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);
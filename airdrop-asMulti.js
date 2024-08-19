const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady, blake2AsHex } = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');

const wallet1Mnemonic = fs.readFileSync(`${process.env.HOME}/.wallet1`, 'utf-8').trim();
const wallet2Address = '16vN968jZh1PHitX7QXDEpy2i5g1C2XrLAPFi4juaJQw1nM';   // temp
const wallet3Address = '13DxmMjYqto1AWsMUSkN8JYNHX6d2vBhuSmapB5iYnEiYaxX';  // temp
const production = false;

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    await cryptoWaitReady();

    
    // Initialize keyring and add accounts
    const keyring = new Keyring({ type: 'sr25519' });
    const wallet1 = keyring.addFromMnemonic(wallet1Mnemonic);
    const threshold = 2; // 2 out of 3
    // Fixed 2nd+3rd wallet address
    const otherSignatories = [wallet2Address, wallet3Address].sort();
    const airdrop = "643";
    
    // Directory containing the .txt files
    const directoryPath = path.join(__dirname, `${airdrop}`);
    // Get all .txt files from the directory
    const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.txt'));
    let nbatches = 0;
    for (const file of files) {
        // Read file content into a string
        const filePath = path.join(directoryPath, file);
        const hexString = fs.readFileSync(filePath, 'utf-8').trim();

        // Create a call using the hex string (considering it's already encoded properly)
        const batch = api.createType('Call', hexString);
	const blake2Hash = blake2AsHex(batch.toHex());
	if ( file.includes(blake2Hash) ) { // CHECKS that the hash of the content of the file is in the filename
            // Create a multisig transaction for the batch
            const multisig = api.tx.multisig.asMulti(
		threshold,
		otherSignatories,
		null,  // maybeTimepoint (use null if not part of a sequence)
		batch,
		0      // maxWeight (0 means the transaction will use the maximum weight)
            );
	    
            // Send the transaction from the first wallet
            if ( production ) {
		const { blockHash } = await multisig.signAndSend(wallet1, { nonce: -1 });
		console.log(`Batch ${nbatches}/${files.length} submitted by Wallet 1 with block hash ${blockHash}`);
      		// await multisige.signAndSend(wallet2, { nonce: -1 });
	    } else {
		console.log(`Batch ${nbatches}/${files.length}: ${file} READY FOR PRODUCTION!`);
		nbatches++;
	    }
	} else {
	    console.log(`Batch ${nbatches}/${files.length}: ${file} HASH check!`);
	    process.exit(0);
	}
    }

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

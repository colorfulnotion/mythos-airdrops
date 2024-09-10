const { ApiPromise, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { hexToBn } = require('@polkadot/util');
const fs = require('fs');
const path = require('path');

// Function to read batch files and store their paths and contents
async function readBatchFiles(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(`Unable to scan directory: ${err}`);
                return;
            }

            const batchCalls = files.map((file) => {
                const filePath = path.join(directoryPath, file);
                if ( filePath.includes(".txt") ) {
                  const rawHexData = fs.readFileSync(filePath, 'utf-8').trim();
                  return { filePath, rawHexData, fileName: file }; // Return file path, content, and file name
                } else {
                  return { }; // Return file path, content, and file name
                }
            });

            resolve(batchCalls);
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

async function getAssetBalance(api, asset, address) {
    try {
        let query = await api.query.assets.account(asset, address);
        let x = query.toJSON();
        if (!x) return 0;
        let balanceRaw = x.balance;
        const balanceBn = hexToBn(balanceRaw, { isLe: false, isNegative: false });
        return balanceBn.toString();
    } catch (error) {
        console.error(`Error fetching asset balance for ${address}:`, error);
        return 0;
    }
}

// Adjusted function to capture log contents and write them to a corresponding .log file in the log directory
async function decodeBatchAndCheckBalances(api, asset, batchCall, logFilePath) {
    let logContents = ''; // Capture log contents

    const call = api.createType('Call', batchCall.rawHexData); // Decode raw hex into a Call object

    // Check if the outer call is a `utility.batch`
    if (call.section === 'utility' && call.method === 'batch') {
        const batchArgs = call.args[0]; // Extract the array of calls from the batch

        for (const innerCall of batchArgs) {
            const decodedInnerCall = api.createType('Call', innerCall.toHex()); // Decode each inner call

            // Check if the inner call is a `foreignAssets.transfer`
            if (decodedInnerCall.section === 'foreignAssets' && decodedInnerCall.method === 'transfer') {
                const { args } = decodedInnerCall.toJSON();
                const address = args.target.id; // The address the funds are being transferred to
                const transferAmountRaw = args.amount; // The transfer amount
                const transferAmountBn = hexToBn(transferAmountRaw, { isLe: false, isNegative: false });
                const transferAmount = transferAmountBn.toString();

                // (1) Get DOT balance from system.account
                const dotBalance = await getDotBalance(api, address);
                // (2) Get asset balance from foreignAssets.balanceOf
                const assetBalance = await getAssetBalance(api, asset, address);
                // (3) Log results
                const dotResult = (dotBalance === 0) ? "NEEDED" : "OKDOT";
                const assetResult = (assetBalance / 10 ** 18 < transferAmount / 10 ** 18) ? "CHECKMYTH" : "OKMYTH";

                const logEntry = `${address}:${transferAmount}:${dotResult}:${assetResult}\n`;
                logContents += logEntry; // Append the log entry to the log contents
                console.log(logEntry.trim()); // Also log to console
            }
        }
    }

    // Write log contents to the log directory with a .log extension
    fs.writeFileSync(logFilePath, logContents);
    console.log(`Log written to: ${logFilePath}`);
}

async function main() {
    // Initialize the API and wait until ready
    const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    await cryptoWaitReady();

    // Read the raw hex call data from the files in the 643/b1 (or whatever) directory
    const airdrop = '643'; // Base directory for airdrop calls grouped into folders by batches
    if ( process.argc < 3 ) {
      console.log("Need group input")
      process.exit(1);
    }
    const batchNumber = process.argv[2];
    console.log("Processing group: ", batchNumber);
    const batchDir = path.join(airdrop, `${batchNumber}`);

    // Define log directory path
    const batchLogDir = path.join(airdrop, `${batchNumber}`, `log`);

    // Ensure the log directory exists, create it if it doesn't
    if (!fs.existsSync(batchLogDir)) {
        fs.mkdirSync(batchLogDir, { recursive: true });
    }

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

    // Process each batch call and generate corresponding log files in the log directory
    for (const batchCall of batchCalls) {
      if ( batchCall.fileName && batchCall.fileName.includes(".txt") ) {
        const logFileName = batchCall.fileName.replace('.txt', '.log'); // Replace .txt with .log
        const logFilePath = path.join(batchLogDir, logFileName); // Log file path in the log directory

        // Check if the log file already exists, if so, skip processing
        if (fs.existsSync(logFilePath)) {
            console.log(`Skipping ${logFileName}, log file already exists.`);
            continue;
        } else {
          console.log(`Executing ${logFileName}`);
        }

        // If the log file does not exist, process and create it
        await decodeBatchAndCheckBalances(api, asset, batchCall, logFilePath);
      }
    }

    // Disconnect from the node
    await api.disconnect();
}

main().catch(console.error);

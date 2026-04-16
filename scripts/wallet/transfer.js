const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
const sleep = require('../../utils/delay');
require('dotenv').config({ path: '.env' });

const toAddress = process.argv[2];
const amountZtx = process.argv[3];

if (!toAddress || !amountZtx) {
    console.error('Usage: node scripts/wallet/transfer.js <toAddress> <amount>');
    console.error('       amount is in ZTX (e.g. 10 = 10 ZTX)');
    process.exit(1);
}

const sourceAddress = process.env.ZTX_ADDRESS;
const privateKey    = process.env.PRIVATE_KEY;

const sdk = new ZtxChainSDK({
    host: process.env.NODE_URL,
    secure: false
});

async function main() {
    // Convert ZTX to MO (1 ZTX = 1,000,000 MO)
    const amountMo = new BigNumber(amountZtx).multipliedBy(1e6).toFixed(0);

    console.log('');
    console.log('From    :', sourceAddress);
    console.log('To      :', toAddress);
    console.log('Amount  :', amountZtx, 'ZTX (', amountMo, 'MO )');
    console.log('Node    :', process.env.NODE_URL);
    console.log('');

    // Get nonce
    const nonceResult = await sdk.account.getNonce(sourceAddress);
    if (nonceResult.errorCode !== 0) {
        console.error('Error getting nonce:', nonceResult.errorDesc);
        process.exit(1);
    }
    const nonce = new BigNumber(nonceResult.result.nonce).plus(1).toString(10);

    // Build gas transfer operation
    const operationResult = sdk.operation.gasSendOperation({
        sourceAddress,
        destAddress: toAddress,
        gasAmount: amountMo,
    });

    if (operationResult.errorCode !== 0) {
        console.error('Error building operation:', operationResult.errorDesc);
        process.exit(1);
    }

    const operationItem = operationResult.result.operation;

    // Evaluate fee
    const feeData = await sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations: [operationItem],
        signtureNumber: '1',
    });

    if (feeData.errorCode !== 0) {
        console.error('Error evaluating fee:', feeData.errorDesc);
        process.exit(1);
    }

    const feeLimit = feeData.result.feeLimit;
    const gasPrice = feeData.result.gasPrice;
    console.log('Fee limit :', feeLimit, 'MO');
    console.log('Gas price :', gasPrice, 'MO');

    // Build blob
    const blobInfo = sdk.transaction.buildBlob({
        sourceAddress,
        gasPrice,
        feeLimit,
        nonce,
        operations: [operationItem],
    });

    // Sign
    const signed = sdk.transaction.sign({
        privateKeys: [privateKey],
        blob: blobInfo.result.transactionBlob,
    });

    // Submit
    const submitted = await sdk.transaction.submit({
        signature: signed.result.signatures,
        blob: blobInfo.result.transactionBlob,
    });

    if (submitted.errorCode !== 0) {
        console.error('Error submitting transaction:', submitted.errorDesc);
        process.exit(1);
    }

    const hash = submitted.result.hash;
    console.log('');
    console.log('Submitted. Hash:', hash);
    console.log('Waiting for confirmation...');

    // Poll for confirmation
    let info = null;
    for (let i = 0; i < 10; i++) {
        sleep(2000);
        info = await sdk.transaction.getInfo(hash);
        if (info.errorCode === 0) break;
        process.stdout.write('.');
    }

    console.log('');
    if (info && info.errorCode === 0) {
        const tx = info.result.transactions[0];
        console.log('');
        console.log('Status  : SUCCESS');
        console.log('Hash    :', hash);
        console.log('Ledger  :', tx.ledger_seq);
        console.log('Fee     :', tx.actual_fee, 'MO');
    } else {
        console.log('Status  : PENDING or NOT FOUND');
        console.log('Run the following to check later:');
        console.log('  node scripts/wallet/tx.js', hash);
    }
    console.log('');
}

main().catch(err => {
    console.error('Unexpected error:', err.message);
    process.exit(1);
});

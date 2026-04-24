'use strict';

/**
 * sign-transfer.js
 *
 * Builds and signs a native ZTX transfer without submitting.
 * Outputs transactionBlob + signatures ready for evaluateFee or submitTransaction.
 *
 * Usage:
 *   node scripts/wallet/sign-transfer.js <toAddress> <amountZtx>
 *
 * Example:
 *   node scripts/wallet/sign-transfer.js ZTX3b69xfJZbiC8WbrtE2Ez27zri3a6K9B5pt 1
 */

const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
require('dotenv').config({ path: '.env' });

const toAddress   = process.argv[2];
const amountZtx   = process.argv[3];

if (!toAddress || !amountZtx) {
    console.error('Usage: node scripts/wallet/sign-transfer.js <toAddress> <amountZtx>');
    process.exit(1);
}

const sourceAddress = process.env.ZTX_ADDRESS;
const privateKey    = process.env.PRIVATE_KEY;

if (!sourceAddress || !privateKey) {
    console.error('ZTX_ADDRESS and PRIVATE_KEY must be set in .env');
    process.exit(1);
}

const sdk = new ZtxChainSDK({
    host:   process.env.NODE_URL,
    secure: false,
});

async function main() {
    const amountMo = new BigNumber(amountZtx).multipliedBy(1e6).toFixed(0);

    console.log('');
    console.log('=== Sign Transfer (no submit) ===');
    console.log('From   :', sourceAddress);
    console.log('To     :', toAddress);
    console.log('Amount :', amountZtx, 'ZTX =', amountMo, 'MO');
    console.log('Node   :', process.env.NODE_URL);
    console.log('');

    // 1. Get nonce
    const nonceResult = await sdk.account.getNonce(sourceAddress);
    if (nonceResult.errorCode !== 0) {
        console.error('getNonce failed:', nonceResult.errorDesc);
        process.exit(1);
    }
    const nonce = new BigNumber(nonceResult.result.nonce).plus(1).toString(10);
    console.log('Nonce  :', nonce);

    // 2. Build operation
    const opResult = sdk.operation.gasSendOperation({
        sourceAddress,
        destAddress: toAddress,
        gasAmount:   amountMo,
    });
    if (opResult.errorCode !== 0) {
        console.error('gasSendOperation failed:', opResult.errorDesc);
        process.exit(1);
    }
    const operation = opResult.result.operation;

    // 3. Evaluate fee (current baseline — no signatures yet)
    const feeResult = await sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations:    [operation],
        signtureNumber: '1',
    });
    if (feeResult.errorCode !== 0) {
        console.error('evaluateFee failed:', feeResult.errorDesc);
        process.exit(1);
    }
    const { feeLimit, gasPrice } = feeResult.result;
    console.log('Fee limit (estimated):', feeLimit, 'MO');
    console.log('Gas price            :', gasPrice, 'MO');
    console.log('');

    // 4. Build blob
    const blobResult = sdk.transaction.buildBlob({
        sourceAddress,
        gasPrice,
        feeLimit,
        nonce,
        operations: [operation],
    });
    if (blobResult.errorCode !== 0) {
        console.error('buildBlob failed:', blobResult.errorDesc);
        process.exit(1);
    }
    const transactionBlob = blobResult.result.transactionBlob;

    // 5. Sign
    const signResult = sdk.transaction.sign({
        privateKeys: [privateKey],
        blob:        transactionBlob,
    });
    if (signResult.errorCode !== 0) {
        console.error('sign failed:', signResult.errorDesc);
        process.exit(1);
    }
    // signatures = [{ signData, publicKey }]
    const signatures = signResult.result.signatures;

    // 6. Output
    console.log('=== transaction_blob ===');
    console.log(transactionBlob);
    console.log('');

    console.log('=== signatures (SDK format) ===');
    signatures.forEach((s, i) => {
        console.log(`[${i}] signData  : ${s.signData}`);
        console.log(`[${i}] publicKey : ${s.publicKey}`);
    });
    console.log('');

    // API format (snake_case) — ready to pass to testTransaction or submitTransaction
    const apiSignatures = signatures.map(s => ({
        sign_data:  s.signData,
        public_key: s.publicKey,
    }));

    console.log('=== testTransaction payload (copy-paste ready) ===');
    console.log(JSON.stringify({
        items: [{
            transaction_blob: transactionBlob,
            signatures:       apiSignatures,
        }]
    }, null, 2));
    console.log('');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

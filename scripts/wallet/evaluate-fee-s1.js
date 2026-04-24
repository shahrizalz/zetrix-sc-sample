'use strict';

/**
 * evaluate-fee-s1.js  —  Scenario 1: privateKeys + transaction JSON
 *
 * The SDK handles the full cycle internally:
 *   1. Build a temp blob (feeLimit=0) and sign it
 *   2. Call testTransaction to get the exact fee
 *   3. Rebuild the blob with the actual fee and re-sign
 *   4. Return { feeLimit, gasPrice, transactionBlob, signatures } — ready to submit
 *
 * Use case: You have the private key available in the script (most common path).
 *
 * Usage:
 *   node scripts/wallet/evaluate-fee-s1.js <toAddress> <amountZtx>
 */

const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
require('dotenv').config({ path: '.env' });

const toAddress = process.argv[2];
const amountZtx = process.argv[3];

if (!toAddress || !amountZtx) {
    console.error('Usage: node scripts/wallet/evaluate-fee-s1.js <toAddress> <amountZtx>');
    process.exit(1);
}

const sourceAddress = process.env.ZTX_ADDRESS;
const privateKey    = process.env.PRIVATE_KEY;

if (!sourceAddress || !privateKey) {
    console.error('ZTX_ADDRESS and PRIVATE_KEY must be set in .env');
    process.exit(1);
}

const sdk = new ZtxChainSDK({ host: process.env.NODE_URL, secure: false });

async function main() {
    const amountMo = new BigNumber(amountZtx).multipliedBy(1e6).toFixed(0);

    console.log('');
    console.log('=== Scenario 1: privateKeys + transaction JSON ===');
    console.log('From   :', sourceAddress);
    console.log('To     :', toAddress);
    console.log('Amount :', amountZtx, 'ZTX =', amountMo, 'MO');
    console.log('');

    // Step 1: Get nonce
    const nonceResult = await sdk.account.getNonce(sourceAddress);
    if (nonceResult.errorCode !== 0) {
        console.error('getNonce failed:', nonceResult.errorDesc);
        process.exit(1);
    }
    const nonce = new BigNumber(nonceResult.result.nonce).plus(1).toString(10);

    // Step 2: Build operation
    const opResult = sdk.operation.gasSendOperation({
        sourceAddress,
        destAddress: toAddress,
        gasAmount: amountMo,
    });
    if (opResult.errorCode !== 0) {
        console.error('gasSendOperation failed:', opResult.errorDesc);
        process.exit(1);
    }

    // Step 3: evaluateFee with privateKeys
    //   SDK internally: temp blob → sign → testTransaction → rebuild with actual fee → re-sign
    //   Returns: { feeLimit, gasPrice, transactionBlob, signatures }
    console.log('Calling evaluateFee({ privateKeys }) ...');
    const feeResult = await sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations: [opResult.result.operation],
        privateKeys: [privateKey],
    });
    if (feeResult.errorCode !== 0) {
        console.error('evaluateFee failed:', feeResult.errorDesc);
        process.exit(1);
    }

    const { feeLimit, gasPrice, transactionBlob, signatures } = feeResult.result;
    console.log('Fee limit :', feeLimit, 'MO');
    console.log('Gas price :', gasPrice, 'MO');
    console.log('Blob      :', transactionBlob.substring(0, 40) + '...');
    console.log('Signatures:', signatures.length, 'signature(s)');
    console.log('');

    // Step 4: Submit — blob and signatures are already final, no extra steps needed
    console.log('Submitting...');
    const submitted = await sdk.transaction.submit({
        blob: transactionBlob,
        signature: signatures,
    });
    if (submitted.errorCode !== 0) {
        console.error('submit failed:', submitted.errorDesc);
        process.exit(1);
    }

    console.log('Hash :', submitted.result.hash);
    console.log('');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

'use strict';

/**
 * evaluate-fee-s3.js  —  Scenario 3: transaction JSON only (no keys, no blob)
 *
 * The SDK sends transaction_json to testTransaction.  The blockchain uses
 * a hardcoded Ed25519 estimate for signature bytes (64 B per key), so the
 * returned fee is an approximation — slightly different from the exact fee
 * when real signatures are included (scenario 1 or 2).
 *
 * Returns: { feeLimit, gasPrice } only.
 *
 * Use case: Display a fee estimate to the user before asking them to sign,
 * without requiring any private key in the calling code.
 * Also the original SDK behaviour before the evaluateFee enhancement.
 *
 * Usage:
 *   node scripts/wallet/evaluate-fee-s3.js <toAddress> <amountZtx>
 */

const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
require('dotenv').config({ path: '.env' });

const toAddress = process.argv[2];
const amountZtx = process.argv[3];

if (!toAddress || !amountZtx) {
    console.error('Usage: node scripts/wallet/evaluate-fee-s3.js <toAddress> <amountZtx>');
    process.exit(1);
}

const sourceAddress = process.env.ZTX_ADDRESS;

if (!sourceAddress) {
    console.error('ZTX_ADDRESS must be set in .env');
    process.exit(1);
}

// No private key needed for this scenario
const sdk = new ZtxChainSDK({ host: process.env.NODE_URL, secure: false });

async function main() {
    const amountMo = new BigNumber(amountZtx).multipliedBy(1e6).toFixed(0);

    console.log('');
    console.log('=== Scenario 3: transaction JSON only (Ed25519 fallback estimate) ===');
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

    // Step 3: evaluateFee with transaction JSON only — no privateKeys, no blob
    //   Blockchain uses Ed25519 signature size estimate → approximate fee.
    //   Returns { feeLimit, gasPrice } only.
    console.log('Calling evaluateFee({ sourceAddress, nonce, operations }) ...');
    const feeResult = await sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations: [opResult.result.operation],
    });
    if (feeResult.errorCode !== 0) {
        console.error('evaluateFee failed:', feeResult.errorDesc);
        process.exit(1);
    }

    console.log('Fee limit (estimate) :', feeResult.result.feeLimit, 'MO');
    console.log('Gas price            :', feeResult.result.gasPrice, 'MO');
    console.log('');
    console.log('Note: fee is an estimate based on Ed25519 signature size.');
    console.log('Use scenario 1 or 2 for an exact fee with real signature bytes.');
    console.log('');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

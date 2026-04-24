'use strict';

/**
 * evaluate-fee-s2.js  —  Scenario 2: transaction blob + signatures
 *
 * The blob was already built and signed externally (e.g. hardware wallet,
 * air-gapped signer, or a separate signing service).  The SDK calls
 * testTransaction with the actual signature bytes so the blockchain returns
 * the exact fee — no Ed25519 estimate fallback.
 *
 * Returns: { feeLimit, gasPrice } only.
 * The SDK cannot rebuild or re-sign on behalf of the external signer.
 * If the returned fee differs from the feeLimit in the blob, the external
 * signer must rebuild and re-sign with the accurate value.
 *
 * This script simulates an "external signer" by using buildBlob + sign
 * directly (bypassing evaluateFee), then passes the result to evaluateFee
 * as scenario 2 to demonstrate the fee check.
 *
 * Usage:
 *   node scripts/wallet/evaluate-fee-s2.js <toAddress> <amountZtx>
 */

const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
require('dotenv').config({ path: '.env' });

const toAddress = process.argv[2];
const amountZtx = process.argv[3];

if (!toAddress || !amountZtx) {
    console.error('Usage: node scripts/wallet/evaluate-fee-s2.js <toAddress> <amountZtx>');
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
    console.log('=== Scenario 2: transaction blob + signatures ===');
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

    // Step 3: External signer path — build blob and sign without going through evaluateFee.
    //   In a real scenario this blob+signature arrives from an external system.
    //   Here we use a placeholder feeLimit of 0 to simulate that the signer
    //   does not know the fee yet (common in offline/hardware-wallet flows).
    console.log('Simulating external signer: buildBlob + sign ...');
    // Use minimum valid values ('1') — buildBlob rejects 0.
    const blobResult = sdk.transaction.buildBlob({
        sourceAddress,
        gasPrice: '1',
        feeLimit:  '1',
        nonce,
        operations: [opResult.result.operation],
    });
    if (blobResult.errorCode !== 0) {
        console.error('buildBlob failed:', blobResult.errorDesc);
        process.exit(1);
    }

    const signResult = sdk.transaction.sign({
        privateKeys: [privateKey],
        blob: blobResult.result.transactionBlob,
    });
    if (signResult.errorCode !== 0) {
        console.error('sign failed:', signResult.errorDesc);
        process.exit(1);
    }

    const transactionBlob = blobResult.result.transactionBlob;
    const signatures      = signResult.result.signatures;

    console.log('Blob      :', transactionBlob.substring(0, 40) + '...');
    console.log('Signatures:', signatures.length, 'signature(s)');
    console.log('');

    // Step 4: evaluateFee with transactionBlob + signatures
    //   Blockchain receives the real sig bytes → accurate fee (no fallback estimate).
    //   Returns { feeLimit, gasPrice } only — SDK cannot re-sign for external signers.
    console.log('Calling evaluateFee({ transactionBlob, signatures }) ...');
    const feeResult = await sdk.transaction.evaluateFee({
        transactionBlob,
        signatures,
    });
    if (feeResult.errorCode !== 0) {
        console.error('evaluateFee failed:', feeResult.errorDesc);
        process.exit(1);
    }

    console.log('Fee limit (exact) :', feeResult.result.feeLimit, 'MO');
    console.log('Gas price         :', feeResult.result.gasPrice, 'MO');
    console.log('');
    console.log('Note: to submit, the external signer must rebuild the blob');
    console.log('with feeLimit =', feeResult.result.feeLimit, 'and re-sign.');
    console.log('');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

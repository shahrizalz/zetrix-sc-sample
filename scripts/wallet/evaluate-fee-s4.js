'use strict';

/**
 * evaluate-fee-s4.js  —  Scenario 4: transaction blob only (no keys, no signatures)
 *
 * The blob exists (built externally or by a prior step) but has not been
 * signed yet.  The SDK passes transaction_blob to testTransaction without
 * any signatures, so the blockchain uses the Ed25519 fallback estimate for
 * signature bytes — similar accuracy to scenario 3 but using blob bytes
 * rather than transaction_json.
 *
 * Returns: { feeLimit, gasPrice } only.
 *
 * Use case: Verify the fee of a pre-built blob before handing it to a signer,
 * without needing any private key in the calling code.
 *
 * Usage:
 *   node scripts/wallet/evaluate-fee-s4.js <toAddress> <amountZtx>
 */

const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
require('dotenv').config({ path: '.env' });

const toAddress = process.argv[2];
const amountZtx = process.argv[3];

if (!toAddress || !amountZtx) {
    console.error('Usage: node scripts/wallet/evaluate-fee-s4.js <toAddress> <amountZtx>');
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
    console.log('=== Scenario 4: transaction blob only (Ed25519 fallback estimate) ===');
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

    // Step 3: Build blob with placeholder feeLimit=0 (fee not known yet).
    //   In a real flow this blob may come from an external builder.
    // Use minimum valid values ('1') — buildBlob rejects 0.
    console.log('Building blob with placeholder fee values ...');
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

    const transactionBlob = blobResult.result.transactionBlob;
    console.log('Blob :', transactionBlob.substring(0, 40) + '...');
    console.log('');

    // Step 4: evaluateFee with transactionBlob only — no signatures
    //   Blockchain uses Ed25519 fallback estimate → approximate fee.
    //   Returns { feeLimit, gasPrice } only.
    console.log('Calling evaluateFee({ transactionBlob }) ...');
    const feeResult = await sdk.transaction.evaluateFee({
        transactionBlob,
    });
    if (feeResult.errorCode !== 0) {
        console.error('evaluateFee failed:', feeResult.errorDesc);
        process.exit(1);
    }

    console.log('Fee limit (estimate) :', feeResult.result.feeLimit, 'MO');
    console.log('Gas price            :', feeResult.result.gasPrice, 'MO');
    console.log('');
    console.log('Note: fee is an estimate — no signature bytes in the blob.');
    console.log('Rebuild the blob with this feeLimit, then sign and submit.');
    console.log('');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

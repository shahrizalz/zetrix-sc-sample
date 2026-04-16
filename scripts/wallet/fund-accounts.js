/**
 * Interactive script to fund one or more accounts.
 *
 * Usage:
 *   node scripts/wallet/fund-accounts.js
 *
 * Prompts:
 *   1. Use default sender from .env, or enter custom address + private key
 *   2. Amount per receiver (ZTX)
 *   3. Receiver address(es) — enter one per prompt, blank line to finish
 *      (also accepts comma-separated on one line)
 *   4. Confirmation before submitting
 */

const readline = require('readline');
const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
const sleep = require('../../utils/delay');
require('dotenv').config({ path: '.env' });

const MO_PER_ZTX = 1_000_000;

// ── readline helpers ──────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
    return new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim())));
}

function askHidden(question) {
    // Use standard readline — input is visible, acceptable for a dev/test script.
    return ask(question);
}

// ── transfer logic ────────────────────────────────────────────────────────────

async function transfer(sdk, sourceAddress, privateKey, toAddress, amountMo) {
    const nonceResult = await sdk.account.getNonce(sourceAddress);
    if (nonceResult.errorCode !== 0) {
        throw new Error(`getNonce failed (${nonceResult.errorCode}): ${nonceResult.errorDesc}`);
    }
    const nonce = new BigNumber(nonceResult.result.nonce).plus(1).toString(10);

    const operationResult = sdk.operation.gasSendOperation({
        sourceAddress,
        destAddress: toAddress,
        gasAmount: amountMo,
    });
    if (operationResult.errorCode !== 0) {
        throw new Error(`gasSendOperation failed (${operationResult.errorCode}): ${operationResult.errorDesc}`);
    }
    const operationItem = operationResult.result.operation;

    const feeData = await sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations: [operationItem],
        signtureNumber: '1',
    });
    if (feeData.errorCode !== 0) {
        throw new Error(`evaluateFee failed (${feeData.errorCode}): ${feeData.errorDesc}`);
    }

    const { feeLimit, gasPrice } = feeData.result;

    const blobInfo = sdk.transaction.buildBlob({
        sourceAddress,
        gasPrice,
        feeLimit,
        nonce,
        operations: [operationItem],
    });
    if (blobInfo.errorCode !== 0) {
        throw new Error(`buildBlob failed (${blobInfo.errorCode}): ${blobInfo.errorDesc}`);
    }

    const signed = sdk.transaction.sign({
        privateKeys: [privateKey],
        blob: blobInfo.result.transactionBlob,
    });
    if (signed.errorCode !== 0) {
        throw new Error(`sign failed (${signed.errorCode}): ${signed.errorDesc}`);
    }

    const submitted = await sdk.transaction.submit({
        signature: signed.result.signatures,
        blob: blobInfo.result.transactionBlob,
    });
    if (submitted.errorCode !== 0) {
        throw new Error(`submit failed (${submitted.errorCode}): ${submitted.errorDesc}`);
    }

    const hash = submitted.result.hash;

    let info = null;
    for (let i = 0; i < 10; i++) {
        sleep(2000);
        info = await sdk.transaction.getInfo(hash);
        if (info.errorCode === 0) break;
        process.stdout.write('.');
    }
    process.stdout.write('\n');

    if (!info || info.errorCode !== 0) {
        return { hash, status: 'PENDING', fee: null, ledger: null };
    }

    const tx = info.result.transactions[0];
    return { hash, status: 'SUCCESS', fee: tx.actual_fee, ledger: tx.ledger_seq };
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
    const hr = '─'.repeat(60);
    console.log('');
    console.log(hr);
    console.log('  Fund Accounts — Interactive Transfer Tool');
    console.log(hr);
    console.log('');

    // ── Step 1: Sender ────────────────────────────────────────────────────────
    const defaultAddress = process.env.ZTX_ADDRESS || '';
    const defaultKey     = process.env.PRIVATE_KEY  || '';
    const nodeUrl        = process.env.NODE_URL      || '';

    let sourceAddress, privateKey;

    if (defaultAddress && defaultKey) {
        console.log(`  Default sender : ${defaultAddress}  (from .env)`);
        console.log(`  Node           : ${nodeUrl}`);
        console.log('');
        const useDefault = await ask('  Use default sender? [Y/n]: ');
        if (useDefault === '' || useDefault.toLowerCase() === 'y') {
            sourceAddress = defaultAddress;
            privateKey    = defaultKey;
        }
    }

    if (!sourceAddress) {
        console.log('');
        sourceAddress = await ask('  Sender address : ');
        if (!sourceAddress) {
            console.error('  Error: sender address is required.');
            process.exit(1);
        }
        privateKey = await askHidden('  Private key    : ');
        if (!privateKey) {
            console.error('  Error: private key is required.');
            process.exit(1);
        }
    }

    // ── Step 2: Amount ────────────────────────────────────────────────────────
    console.log('');
    let amountZtx = '';
    while (true) {
        amountZtx = await ask('  Amount per receiver (ZTX): ');
        if (amountZtx && !isNaN(Number(amountZtx)) && Number(amountZtx) > 0) break;
        console.log('  Please enter a positive number.');
    }
    const amountMo = new BigNumber(amountZtx).multipliedBy(MO_PER_ZTX).toFixed(0);

    // ── Step 3: Receivers ─────────────────────────────────────────────────────
    console.log('');
    console.log('  Enter receiver address(es).');
    console.log('  – One address per line  (blank line when done)');
    console.log('  – Or multiple addresses comma-separated on one line');
    console.log('');

    const receivers = [];
    while (true) {
        const raw = await ask(`  Receiver ${receivers.length + 1} (or blank to finish): `);
        if (raw === '') {
            if (receivers.length === 0) {
                console.log('  At least one receiver is required.');
                continue;
            }
            break;
        }
        // Support comma-separated input on a single line
        const addrs = raw.split(',').map(s => s.trim()).filter(Boolean);
        for (const addr of addrs) {
            if (!receivers.includes(addr)) {
                receivers.push(addr);
            } else {
                console.log(`  (Skipped duplicate: ${addr})`);
            }
        }
    }

    // ── Step 4: Summary + Confirm ─────────────────────────────────────────────
    const totalZtx = new BigNumber(amountZtx).multipliedBy(receivers.length).toFixed(6);
    console.log('');
    console.log(hr);
    console.log('  Summary');
    console.log(hr);
    console.log(`  From      : ${sourceAddress}`);
    console.log(`  Amount    : ${amountZtx} ZTX (${amountMo} MO) per receiver`);
    console.log(`  Receivers : ${receivers.length}`);
    receivers.forEach((addr, i) => console.log(`    ${String(i + 1).padStart(2)}. ${addr}`));
    console.log(`  Total     : ~${totalZtx} ZTX (excl. fees)`);
    console.log(`  Node      : ${nodeUrl}`);
    console.log(hr);
    console.log('');

    const confirm = await ask('  Proceed? [Y/n]: ');
    if (confirm.toLowerCase() === 'n') {
        console.log('  Aborted.');
        rl.close();
        return;
    }

    // ── Step 5: Execute ───────────────────────────────────────────────────────
    const sdk = new ZtxChainSDK({ host: nodeUrl, secure: false });

    console.log('');
    console.log(hr);
    console.log('  Sending...');
    console.log(hr);

    let successCount = 0;
    let failCount    = 0;

    for (let i = 0; i < receivers.length; i++) {
        const to = receivers[i];
        process.stdout.write(`  [${i + 1}/${receivers.length}] → ${to}  `);
        try {
            const result = await transfer(sdk, sourceAddress, privateKey, to, amountMo);
            if (result.status === 'SUCCESS') {
                console.log(`  ✓ ${result.status}  hash: ${result.hash}  fee: ${result.fee} MO  ledger: ${result.ledger}`);
                successCount++;
            } else {
                console.log(`  ~ ${result.status}  hash: ${result.hash}`);
                console.log(`    Check later: node scripts/wallet/tx.js ${result.hash}`);
                failCount++;
            }
        } catch (err) {
            console.log(`  ✗ FAILED  ${err.message}`);
            failCount++;
        }
    }

    console.log('');
    console.log(hr);
    console.log(`  Done. ${successCount} succeeded, ${failCount} failed / pending.`);
    console.log(hr);
    console.log('');

    rl.close();
}

main().catch((err) => {
    console.error('\nUnexpected error:', err.message);
    rl.close();
    process.exit(1);
});
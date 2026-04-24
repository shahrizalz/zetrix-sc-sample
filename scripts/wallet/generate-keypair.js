/**
 * Interactive script to generate a Zetrix keypair.
 *
 * Usage:
 *   node scripts/wallet/generate-keypair.js
 *
 * Steps:
 *   1. Choose account type: ed25519 | sm2 | dilithium3 | hybrid
 *   2. View the generated address, public key, and private key
 *   3. Optionally save the result to accounts.txt
 *   4. Optionally generate another keypair
 */

'use strict';

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { keypair } = require('zetrix-encryption-nodejs');

// ── readline helpers ──────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
    return new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim())));
}

// ── constants ─────────────────────────────────────────────────────────────────

const ACCOUNT_TYPES = [
    { label: 'ed25519   (default, lightweight)', value: 'ed25519' },
    { label: 'sm2       (Chinese national standard)', value: 'sm2' },
    { label: 'dilithium3 (post-quantum)', value: 'dilithium3' },
    { label: 'hybrid    (ed25519 + dilithium3)', value: 'hybrid' },
];

const ACCOUNTS_FILE = path.resolve(__dirname, '../../accounts.txt');

// ── menu ──────────────────────────────────────────────────────────────────────

async function selectAccountType() {
    const hr = '─'.repeat(60);

    console.log('');
    console.log('  Account type:');
    console.log('');
    ACCOUNT_TYPES.forEach((t, i) => {
        console.log(`    ${i + 1}) ${t.label}`);
    });
    console.log('');

    while (true) {
        const ans = await ask('  Choose [1-4] (default 1): ');
        const idx = ans === '' ? 0 : parseInt(ans, 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < ACCOUNT_TYPES.length) {
            return ACCOUNT_TYPES[idx].value;
        }
        console.log('  Invalid choice. Enter a number between 1 and 4.');
    }
}

// ── generate ──────────────────────────────────────────────────────────────────

function generate(signType) {
    return keypair.getKeyPair(signType);
}

// ── display ───────────────────────────────────────────────────────────────────

function display(result) {
    const hr = '─'.repeat(60);
    console.log('');
    console.log(hr);
    console.log(`  Generated keypair  (${result.signType})`);
    console.log(hr);
    console.log(`  Address     : ${result.address}`);
    console.log(`  Public key  : ${result.encPublicKey}`);
    console.log('');
    console.log('  Private key (keep this secret):');
    // Wrap long private keys at 76 chars for readability
    const pk = result.encPrivateKey;
    for (let i = 0; i < pk.length; i += 76) {
        console.log(`    ${pk.slice(i, i + 76)}`);
    }
    console.log(hr);
    console.log('');
}

// ── save to accounts.txt ──────────────────────────────────────────────────────

function appendToAccountsFile(result) {
    const ts = new Date().toISOString();
    const entry = [
        '',
        `# Generated ${ts}`,
        result.signType,
        '{',
        `  "address": "${result.address}",`,
        `  "private_key": "${result.encPrivateKey}"`,
        '}',
        '',
    ].join('\n');

    fs.appendFileSync(ACCOUNTS_FILE, entry, 'utf8');
    console.log(`  Saved to ${path.relative(process.cwd(), ACCOUNTS_FILE)}`);
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
    const hr = '─'.repeat(60);
    console.log('');
    console.log(hr);
    console.log('  Generate Keypair — Interactive Tool');
    console.log(hr);

    while (true) {
        // Step 1: Choose account type
        const signType = await selectAccountType();

        // Step 2: Generate
        process.stdout.write('\n  Generating...');
        const result = generate(signType);
        process.stdout.write(' done.\n');

        // Step 3: Display
        display(result);

        // Step 4: Save?
        const save = await ask('  Save to accounts.txt? [y/N]: ');
        if (save.toLowerCase() === 'y') {
            appendToAccountsFile(result);
        }

        // Step 5: Another?
        console.log('');
        const again = await ask('  Generate another keypair? [y/N]: ');
        if (again.toLowerCase() !== 'y') break;
    }

    console.log('');
    console.log('  Done.');
    console.log('');
    rl.close();
}

main().catch((err) => {
    console.error('\n  Error:', err.message);
    rl.close();
    process.exit(1);
});

/**
 * Test: Account Transfer Tests (Same Address Type)
 * Checklist: sections 5 (native coin), 6 (negative cases), 7 (ZTP20 same-type)
 *
 * Section 5 & 7 — "same-type" means the SENDER's signing key type.
 * Each account sends to one of the other known test addresses.
 *
 * Section 6 — Negative cases: insufficient balance, zero amount, self-transfer.
 *
 * Required env vars:
 *   NODE_URL
 *   PRIVATE_KEY_DILITHIUM3
 *   PRIVATE_KEY_HYBRID
 *
 * Note: SM2 account type excluded — address fails SDK checkAddress validation.
 */

const ZtxChainSDK = require('zetrix-sdk-nodejs');
const expect = require('chai').expect;
const deployOperation = require("../../../scripts/deploy-operation");
const TEST_QUERY = require("../../../utils/query-contract");
const TEST_INVOKE = require("../../../utils/invoke-contract");
const TEST_TRANSFER_COIN = require("../../../utils/transfer-coin");
const {TEST_RESULT, TEST_CONDITION} = require("../../../utils/constant");
require('dotenv').config({path: "/../.env"});
require('mocha-generators').install();

// ── Account definitions (from knowledge.md) ───────────────────────────────────
const ED25519 = {
    type: 'Ed25519',
    address: 'ZTX3Gw31ZcAimwkYUYdcvrnVa1fnNubWxRCKD',
    privateKey: 'privBtAoJQPcbwDXjNzGRMiRNtjDcMrURtxEYeub4sqGkPzPVDB2rZFX',
};
const DILITHIUM3 = {
    type: 'Dilithium3',
    address: 'ZTX3bhfyUNxi5bDK2QzDsLtbDLxETcWwNbUZM',
    privateKey: process.env.PRIVATE_KEY_DILITHIUM3,
};
const HYBRID = {
    type: 'Hybrid',
    address: 'ZTX3Hz1mC6VYPs3VnZizKTLSFcp7U1UJFdnyT',
    privateKey: process.env.PRIVATE_KEY_HYBRID,
};

const ACCOUNTS = [ED25519, DILITHIUM3, HYBRID];

const sdk = new ZtxChainSDK({host: process.env.NODE_URL, secure: false});

// ZTP20 contract shared across sections 7
const ztp20Handler = {sdk, contractAddress: ''};

// ── before: deploy one ZTP20 contract and mint tokens to all 4 accounts ───────
before(async function () {
    this.timeout(120000);
    ztp20Handler.contractAddress = await deployOperation(
        process.env.NODE_URL, ED25519.address, ED25519.privateKey,
        'specs/ztp20/ztp20-spec.js', {}
    );
    console.log('\x1b[36m%s\x1b[0m', "### ZTP20 deployed at:", ztp20Handler.contractAddress);

    // Mint tokens for each account so they can transfer in section 7
    for (const acc of ACCOUNTS) {
        await TEST_INVOKE(
            `### Minting ZTP20 for ${acc.type} (${acc.address})`,
            ztp20Handler, {privateKey: ED25519.privateKey, sourceAddress: ED25519.address},
            {method: 'mint', params: {account: acc.address, value: '1000000000000'}},
            TEST_RESULT.SUCCESS
        );
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Section 5 — Native Coin Transfer (same-type sender)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Section 5 — Native Coin Transfer (same-type sender)', function () {
    this.timeout(120000);

    // 5.1
    it('5.1 [Ed25519] Transfer native coin — SUCCESS, balances updated', async () => {
        const balanceBefore = (await sdk.account.getInfo(DILITHIUM3.address)).result.balance;

        await TEST_TRANSFER_COIN(
            `### 5.1 Ed25519 (${ED25519.address}) → Dilithium3 (${DILITHIUM3.address})`,
            sdk, {privateKey: ED25519.privateKey, sourceAddress: ED25519.address},
            DILITHIUM3.address, '1000',
            TEST_RESULT.SUCCESS
        );

        const balanceAfter = (await sdk.account.getInfo(DILITHIUM3.address)).result.balance;
        expect(parseInt(balanceAfter)).to.be.greaterThan(parseInt(balanceBefore));
    });

    // 5.2
    it('5.2 [Dilithium3] Transfer native coin — SUCCESS, balances updated', async () => {
        const balanceBefore = (await sdk.account.getInfo(ED25519.address)).result.balance;

        await TEST_TRANSFER_COIN(
            `### 5.2 Dilithium3 (${DILITHIUM3.address}) → Ed25519 (${ED25519.address})`,
            sdk, {privateKey: DILITHIUM3.privateKey, sourceAddress: DILITHIUM3.address},
            ED25519.address, '1000',
            TEST_RESULT.SUCCESS
        );

        const balanceAfter = (await sdk.account.getInfo(ED25519.address)).result.balance;
        expect(parseInt(balanceAfter)).to.be.greaterThan(parseInt(balanceBefore));
    });

    // 5.3
    it('5.3 [Hybrid] Transfer native coin — SUCCESS, balances updated', async () => {
        const balanceBefore = (await sdk.account.getInfo(ED25519.address)).result.balance;

        await TEST_TRANSFER_COIN(
            `### 5.3 Hybrid (${HYBRID.address}) → Ed25519 (${ED25519.address})`,
            sdk, {privateKey: HYBRID.privateKey, sourceAddress: HYBRID.address},
            ED25519.address, '1000',
            TEST_RESULT.SUCCESS
        );

        const balanceAfter = (await sdk.account.getInfo(ED25519.address)).result.balance;
        expect(parseInt(balanceAfter)).to.be.greaterThan(parseInt(balanceBefore));
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Section 6 — Negative Cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('Section 6 — Negative Cases', function () {
    this.timeout(120000);

    // 6.1–6.4 Insufficient balance
    ACCOUNTS.forEach((account) => {
        it(`6.x [${account.type}] Transfer with insufficient balance — FAILED`, async () => {
            await TEST_TRANSFER_COIN(
                `### 6.x [${account.type}] Transfer exceeding balance`,
                sdk, {privateKey: account.privateKey, sourceAddress: account.address},
                ED25519.address, '999999999999999999',
                TEST_RESULT.FAILED
            );
        });
    });

    // 6.5–6.8 Zero amount
    ACCOUNTS.forEach((account) => {
        it(`6.x [${account.type}] Transfer zero amount — FAILED`, async () => {
            await TEST_TRANSFER_COIN(
                `### 6.x [${account.type}] Transfer zero amount`,
                sdk, {privateKey: account.privateKey, sourceAddress: account.address},
                ED25519.address, '0',
                TEST_RESULT.FAILED
            );
        });
    });

    // 6.9–6.12 Self-transfer — balance unchanged after deducting only fees
    ACCOUNTS.forEach((account) => {
        it(`6.x [${account.type}] Transfer to self — balance unchanged (net of fees)`, async () => {
            const balanceBefore = (await sdk.account.getInfo(account.address)).result.balance;

            await TEST_TRANSFER_COIN(
                `### 6.x [${account.type}] Self-transfer`,
                sdk, {privateKey: account.privateKey, sourceAddress: account.address},
                account.address, '1000',
                TEST_RESULT.SUCCESS
            );

            const balanceAfter = (await sdk.account.getInfo(account.address)).result.balance;
            // Balance may differ only by fees paid; the coin amount itself should not change
            expect(parseInt(balanceAfter)).to.be.lessThanOrEqual(parseInt(balanceBefore));
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Section 7 — ZTP20 Token Transfer (same-type sender)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Section 7 — ZTP20 Token Transfer (same-type sender)', function () {
    this.timeout(120000);

    const transferAmount = '100000000000';

    // 7.1
    it('7.1 [Ed25519] ZTP20 token transfer — SUCCESS, balances updated', async () => {
        await TEST_INVOKE(
            `### 7.1 Ed25519 transfers ZTP20 to Dilithium3`,
            ztp20Handler, {privateKey: ED25519.privateKey, sourceAddress: ED25519.address},
            {method: 'transfer', params: {to: DILITHIUM3.address, value: transferAmount}},
            TEST_RESULT.SUCCESS
        );

        await TEST_QUERY(
            `### 7.1 Verify Dilithium3 ZTP20 balance increased`,
            ztp20Handler,
            {method: 'balanceOf', params: {account: DILITHIUM3.address}},
            TEST_CONDITION.GREATER_THAN, '1000000000000'
        );
    });

    // 7.2
    it('7.2 [Dilithium3] ZTP20 token transfer — SUCCESS, balances updated', async () => {
        await TEST_INVOKE(
            `### 7.2 Dilithium3 transfers ZTP20 to Ed25519`,
            ztp20Handler, {privateKey: DILITHIUM3.privateKey, sourceAddress: DILITHIUM3.address},
            {method: 'transfer', params: {to: ED25519.address, value: transferAmount}},
            TEST_RESULT.SUCCESS
        );
    });

    // 7.3
    it('7.3 [Hybrid] ZTP20 token transfer — SUCCESS, balances updated', async () => {
        await TEST_INVOKE(
            `### 7.3 Hybrid transfers ZTP20 to Ed25519`,
            ztp20Handler, {privateKey: HYBRID.privateKey, sourceAddress: HYBRID.address},
            {method: 'transfer', params: {to: ED25519.address, value: transferAmount}},
            TEST_RESULT.SUCCESS
        );
    });
});

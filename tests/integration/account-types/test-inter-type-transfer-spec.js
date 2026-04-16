/**
 * Test: Account Inter-Address Type Transfer Tests
 * Checklist: section 8 (native coin cross-type), 9 (ZTP20 cross-type),
 *            10 (contract cross-type invocation), 11 (approve+transferFrom cross-type)
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

// Shared ZTP20 contract for sections 9 & 11
const ztp20Handler = {sdk, contractAddress: ''};

// Per-deployer contract addresses for section 10
const crossTypeContracts = {};

// ── before: deploy ZTP20, mint to all accounts; deploy per-type contracts ─────
before(async function () {
    this.timeout(240000);

    // ZTP20 contract for cross-type token transfer tests
    ztp20Handler.contractAddress = await deployOperation(
        process.env.NODE_URL, ED25519.address, ED25519.privateKey,
        'specs/ztp20/ztp20-spec.js', {}
    );
    console.log('\x1b[36m%s\x1b[0m', "### ZTP20 for cross-type tests deployed at:", ztp20Handler.contractAddress);

    // Mint tokens to each account for sections 9 & 11
    for (const acc of ACCOUNTS) {
        await TEST_INVOKE(
            `### Minting ZTP20 for ${acc.type}`,
            ztp20Handler, {privateKey: ED25519.privateKey, sourceAddress: ED25519.address},
            {method: 'mint', params: {account: acc.address, value: '1000000000000'}},
            TEST_RESULT.SUCCESS
        );
    }

    // Deploy one ZTP20 contract per account type for section 10
    for (const deployer of ACCOUNTS) {
        crossTypeContracts[deployer.type] = await deployOperation(
            process.env.NODE_URL, deployer.address, deployer.privateKey,
            'specs/ztp20/ztp20-spec.js', {}
        );
        console.log('\x1b[36m%s\x1b[0m', `### [Section 10] ${deployer.type} contract deployed at:`, crossTypeContracts[deployer.type]);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Section 8 — Native Coin (ZTX) Cross-Type Transfers
// ═══════════════════════════════════════════════════════════════════════════════
describe('Section 8 — Native Coin Cross-Type Transfers', function () {
    this.timeout(120000);

    const amount = '1000'; // 0.001 ZTX in MO

    // Generate all ordered pairs (from, to) where from !== to
    const pairs = [];
    for (const from of ACCOUNTS) {
        for (const to of ACCOUNTS) {
            if (from.type !== to.type) {
                pairs.push({from, to});
            }
        }
    }

    pairs.forEach(({from, to}, idx) => {
        it(`8.${idx + 1} [${from.type} → ${to.type}] Native coin transfer — SUCCESS, balances updated`, async () => {
            const balanceBefore = (await sdk.account.getInfo(to.address)).result.balance;

            await TEST_TRANSFER_COIN(
                `### 8.${idx + 1} ${from.type} (${from.address}) → ${to.type} (${to.address})`,
                sdk, {privateKey: from.privateKey, sourceAddress: from.address},
                to.address, amount,
                TEST_RESULT.SUCCESS
            );

            const balanceAfter = (await sdk.account.getInfo(to.address)).result.balance;
            expect(parseInt(balanceAfter)).to.be.greaterThan(parseInt(balanceBefore));
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Section 9 — ZTP20 Token Transfer Cross-Type
// ═══════════════════════════════════════════════════════════════════════════════
describe('Section 9 — ZTP20 Token Cross-Type Transfers', function () {
    this.timeout(120000);

    const transferAmount = '10000000000'; // 10 tokens

    const pairs = [];
    for (const from of ACCOUNTS) {
        for (const to of ACCOUNTS) {
            if (from.type !== to.type) {
                pairs.push({from, to});
            }
        }
    }

    pairs.forEach(({from, to}, idx) => {
        it(`9.${idx + 1} [${from.type} → ${to.type}] ZTP20 transfer — SUCCESS, balances updated`, async () => {
            const balanceBefore = await TEST_QUERY(
                `### 9.${idx + 1} Getting ${to.type} ZTP20 balance before`,
                ztp20Handler,
                {method: 'balanceOf', params: {account: to.address}},
                TEST_CONDITION.GREATER_THAN_OR_EQUAL, '0'
            );

            await TEST_INVOKE(
                `### 9.${idx + 1} ${from.type} (${from.address}) → ${to.type} (${to.address})`,
                ztp20Handler, {privateKey: from.privateKey, sourceAddress: from.address},
                {method: 'transfer', params: {to: to.address, value: transferAmount}},
                TEST_RESULT.SUCCESS
            );

            await TEST_QUERY(
                `### 9.${idx + 1} Verify ${to.type} ZTP20 balance increased`,
                ztp20Handler,
                {method: 'balanceOf', params: {account: to.address}},
                TEST_CONDITION.GREATER_THAN, balanceBefore || '0'
            );
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Section 10 — Smart Contract Invocation Cross-Type (Deployer vs Invoker)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Section 10 — Contract Cross-Type Invocation', function () {
    this.timeout(120000);

    // 10.1 Deployed by Ed25519, invoked by Dilithium3
    it('10.1 [Ed25519 deployer → Dilithium3 invoker] Invoke contract — SUCCESS', async () => {
        const handler = {sdk, contractAddress: crossTypeContracts[ED25519.type]};
        await TEST_INVOKE(
            `### 10.1 Dilithium3 invokes Ed25519-deployed contract`,
            handler, {privateKey: DILITHIUM3.privateKey, sourceAddress: DILITHIUM3.address},
            {method: 'mint', params: {account: DILITHIUM3.address, value: '100000000000'}},
            TEST_RESULT.SUCCESS
        );
    });

    // 10.2 Deployed by Dilithium3, invoked by Hybrid
    it('10.2 [Dilithium3 deployer → Hybrid invoker] Invoke contract — SUCCESS', async () => {
        const handler = {sdk, contractAddress: crossTypeContracts[DILITHIUM3.type]};
        await TEST_INVOKE(
            `### 10.2 Hybrid invokes Dilithium3-deployed contract`,
            handler, {privateKey: HYBRID.privateKey, sourceAddress: HYBRID.address},
            {method: 'mint', params: {account: HYBRID.address, value: '100000000000'}},
            TEST_RESULT.SUCCESS
        );
    });

    // 10.3 Deployed by Hybrid, invoked by Ed25519
    it('10.3 [Hybrid deployer → Ed25519 invoker] Invoke contract — SUCCESS', async () => {
        const handler = {sdk, contractAddress: crossTypeContracts[HYBRID.type]};
        await TEST_INVOKE(
            `### 10.3 Ed25519 invokes Hybrid-deployed contract`,
            handler, {privateKey: ED25519.privateKey, sourceAddress: ED25519.address},
            {method: 'mint', params: {account: ED25519.address, value: '100000000000'}},
            TEST_RESULT.SUCCESS
        );
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Section 11 — ZTP20 approve + transferFrom Cross-Type
// ═══════════════════════════════════════════════════════════════════════════════
describe('Section 11 — ZTP20 approve + transferFrom Cross-Type', function () {
    this.timeout(120000);

    const approvalAmount = '50000000000';

    // 11.1 Owner: Ed25519, Spender: Dilithium3
    it('11.1 [Ed25519 owner → Dilithium3 spender] approve + transferFrom — SUCCESS', async () => {
        await TEST_INVOKE(
            `### 11.1 Ed25519 approves Dilithium3 as spender`,
            ztp20Handler, {privateKey: ED25519.privateKey, sourceAddress: ED25519.address},
            {method: 'approve', params: {spender: DILITHIUM3.address, value: approvalAmount}},
            TEST_RESULT.SUCCESS
        );

        await TEST_QUERY(
            `### 11.1 Verify allowance is set`,
            ztp20Handler,
            {method: 'allowance', params: {owner: ED25519.address, spender: DILITHIUM3.address}},
            TEST_CONDITION.EQUALS, approvalAmount
        );

        await TEST_INVOKE(
            `### 11.1 Dilithium3 calls transferFrom on Ed25519's tokens`,
            ztp20Handler, {privateKey: DILITHIUM3.privateKey, sourceAddress: DILITHIUM3.address},
            {method: 'transferFrom', params: {from: ED25519.address, to: DILITHIUM3.address, value: approvalAmount}},
            TEST_RESULT.SUCCESS
        );
    });

    // 11.2 Owner: Dilithium3, Spender: Hybrid
    it('11.2 [Dilithium3 owner → Hybrid spender] approve + transferFrom — SUCCESS', async () => {
        await TEST_INVOKE(
            `### 11.2 Dilithium3 approves Hybrid as spender`,
            ztp20Handler, {privateKey: DILITHIUM3.privateKey, sourceAddress: DILITHIUM3.address},
            {method: 'approve', params: {spender: HYBRID.address, value: approvalAmount}},
            TEST_RESULT.SUCCESS
        );

        await TEST_INVOKE(
            `### 11.2 Hybrid calls transferFrom on Dilithium3's tokens`,
            ztp20Handler, {privateKey: HYBRID.privateKey, sourceAddress: HYBRID.address},
            {method: 'transferFrom', params: {from: DILITHIUM3.address, to: HYBRID.address, value: approvalAmount}},
            TEST_RESULT.SUCCESS
        );
    });

    // 11.3 Owner: Hybrid, Spender: Ed25519
    it('11.3 [Hybrid owner → Ed25519 spender] approve + transferFrom — SUCCESS', async () => {
        await TEST_INVOKE(
            `### 11.3 Hybrid approves Ed25519 as spender`,
            ztp20Handler, {privateKey: HYBRID.privateKey, sourceAddress: HYBRID.address},
            {method: 'approve', params: {spender: ED25519.address, value: approvalAmount}},
            TEST_RESULT.SUCCESS
        );

        await TEST_INVOKE(
            `### 11.3 Ed25519 calls transferFrom on Hybrid's tokens`,
            ztp20Handler, {privateKey: ED25519.privateKey, sourceAddress: ED25519.address},
            {method: 'transferFrom', params: {from: HYBRID.address, to: ED25519.address, value: approvalAmount}},
            TEST_RESULT.SUCCESS
        );
    });

    // 11.4 transferFrom without prior approval — FAILED
    it('11.4 [Hybrid → Dilithium3] transferFrom without approval — FAILED', async () => {
        await TEST_INVOKE(
            `### 11.4 Dilithium3 calls transferFrom without Hybrid approval — FAILED`,
            ztp20Handler, {privateKey: DILITHIUM3.privateKey, sourceAddress: DILITHIUM3.address},
            {method: 'transferFrom', params: {from: HYBRID.address, to: DILITHIUM3.address, value: '1000000000'}},
            TEST_RESULT.FAILED
        );
    });
});

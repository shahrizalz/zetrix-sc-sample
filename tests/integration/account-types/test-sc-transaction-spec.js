/**
 * Test: Smart Contract Transaction Tests
 * Checklist: sections 1 (Deploy), 2 (Invoke), 3 (Query), 4 (ZTP20 token operations)
 *
 * Each account type deploys its own ZTP20 contract instance and runs the full
 * deploy → invoke → query → ZTP20 lifecycle.
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
const {TEST_RESULT, TEST_CONDITION} = require("../../../utils/constant");
require('dotenv').config({path: "/../.env"});
require('mocha-generators').install();

// ── Account definitions (from knowledge.md) ───────────────────────────────────
const ACCOUNTS = [
    {
        type: 'Ed25519',
        address: 'ZTX3Gw31ZcAimwkYUYdcvrnVa1fnNubWxRCKD',
        privateKey: 'privBtAoJQPcbwDXjNzGRMiRNtjDcMrURtxEYeub4sqGkPzPVDB2rZFX',
    },
    {
        type: 'Dilithium3',
        address: 'ZTX3bhfyUNxi5bDK2QzDsLtbDLxETcWwNbUZM',
        privateKey: process.env.PRIVATE_KEY_DILITHIUM3,
    },
    {
        type: 'Hybrid',
        address: 'ZTX3Hz1mC6VYPs3VnZizKTLSFcp7U1UJFdnyT',
        privateKey: process.env.PRIVATE_KEY_HYBRID,
    },
];

// ── Run a describe suite for each account type ────────────────────────────────
ACCOUNTS.forEach((account) => {

    describe(`SC Transaction Tests — ${account.type} (${account.address})`, function () {
        this.timeout(120000);

        const contractHandler = {
            sdk: new ZtxChainSDK({host: process.env.NODE_URL, secure: false}),
            contractAddress: '',
        };
        const txInitiator = {privateKey: account.privateKey, sourceAddress: account.address};

        // ── 1.x Deploy ───────────────────────────────────────────────────────
        before(async function () {
            contractHandler.contractAddress = await deployOperation(
                process.env.NODE_URL, account.address, account.privateKey,
                'specs/ztp20/ztp20-spec.js', {}
            );
            console.log('\x1b[36m%s\x1b[0m', `### [${account.type}] Contract deployed at:`, contractHandler.contractAddress);
        });

        it(`1.x [${account.type}] Deploy contract — SUCCESS`, async () => {
            expect(contractHandler.contractAddress).to.be.a('string').and.not.empty;
        });

        // ── 2.x Invoke ───────────────────────────────────────────────────────
        it(`2.x [${account.type}] Invoke contract method (mint) — SUCCESS`, async () => {
            await TEST_INVOKE(
                `### 2.x [${account.type}] Minting tokens`,
                contractHandler, txInitiator,
                {method: 'mint', params: {account: account.address, value: '1000000000000'}},
                TEST_RESULT.SUCCESS
            );
        });

        it(`2.x [${account.type}] Invoke with invalid params — FAILED`, async () => {
            await TEST_INVOKE(
                `### 2.x [${account.type}] Minting with invalid value`,
                contractHandler, txInitiator,
                {method: 'mint', params: {account: account.address, value: '-1'}},
                TEST_RESULT.FAILED
            );
        });

        // ── 3.x Query ────────────────────────────────────────────────────────
        it(`3.x [${account.type}] Query contract state (balanceOf) — matches expected value`, async () => {
            await TEST_QUERY(
                `### 3.x [${account.type}] Getting balanceOf`,
                contractHandler,
                {method: 'balanceOf', params: {account: account.address}},
                TEST_CONDITION.EQUALS, '1000000000000'
            );
        });

        // ── 4.x ZTP20 token operations ────────────────────────────────────────
        it(`4.x [${account.type}] Mint ZTP20 tokens — SUCCESS`, async () => {
            await TEST_INVOKE(
                `### 4.x [${account.type}] Minting ZTP20`,
                contractHandler, txInitiator,
                {method: 'mint', params: {account: account.address, value: '500000000000'}},
                TEST_RESULT.SUCCESS
            );
        });

        it(`4.x [${account.type}] Transfer ZTP20 tokens — SUCCESS`, async () => {
            // Transfer to any other known address (cross-type recipient is valid)
            const recipient = ACCOUNTS.find(a => a.address !== account.address).address;
            await TEST_INVOKE(
                `### 4.x [${account.type}] Transferring ZTP20 to ${recipient}`,
                contractHandler, txInitiator,
                {method: 'transfer', params: {to: recipient, value: '100000000000'}},
                TEST_RESULT.SUCCESS
            );
        });

        it(`4.x [${account.type}] Burn ZTP20 tokens — SUCCESS`, async () => {
            await TEST_INVOKE(
                `### 4.x [${account.type}] Burning ZTP20`,
                contractHandler, txInitiator,
                {method: 'burn', params: {account: account.address, value: '100000000000'}},
                TEST_RESULT.SUCCESS
            );
        });

        it(`4.x [${account.type}] approve + transferFrom (unauthorized caller) — FAILED`, async () => {
            const spender = ACCOUNTS.find(a => a.address !== account.address).address;

            // Owner approves spender
            await TEST_INVOKE(
                `### 4.x [${account.type}] Approving spender ${spender}`,
                contractHandler, txInitiator,
                {method: 'approve', params: {spender, value: '100000000000'}},
                TEST_RESULT.SUCCESS
            );

            // Owner calls transferFrom using owner's key instead of spender's — must FAIL
            await TEST_INVOKE(
                `### 4.x [${account.type}] transferFrom with owner key (not spender) — FAILED`,
                contractHandler, txInitiator,
                {method: 'transferFrom', params: {from: account.address, to: spender, value: '100000000000'}},
                TEST_RESULT.FAILED
            );
        });
    });
});

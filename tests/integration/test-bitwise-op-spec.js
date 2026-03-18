const ZtxChainSDK = require('zetrix-sdk-nodejs');
const {TEST_RESULT, TEST_CONDITION, TEST_RESP_TYPE} = require("../../utils/constant");
const TEST_QUERY = require("../../utils/query-contract");
require('dotenv').config({path: "/../.env"})
require('mocha-generators').install();

const contractHandler = {
    sdk: new ZtxChainSDK({
        host: process.env.NODE_URL,
        secure: false
    }),
    contractAddress: process.env.SPEC_BITWISE_OP,
};

describe('Test contract bitwise-op', function () {
    this.timeout(30000);

    // ── int64 AND ─────────────────────────────────────────────────────────────

    it('int64And: 12 & 10 = 8', async () => {
        await TEST_QUERY("### int64And 12 & 10",
            contractHandler, {
                method: 'int64And',
                params: {a: "12", b: "10"}
            }, TEST_CONDITION.EQUALS, "8", "data");
    });

    it('int64And: 255 & 255 = 255', async () => {
        await TEST_QUERY("### int64And 255 & 255",
            contractHandler, {
                method: 'int64And',
                params: {a: "255", b: "255"}
            }, TEST_CONDITION.EQUALS, "255", "data");
    });

    // ── int64 OR ──────────────────────────────────────────────────────────────

    it('int64Or: 12 | 10 = 14', async () => {
        await TEST_QUERY("### int64Or 12 | 10",
            contractHandler, {
                method: 'int64Or',
                params: {a: "12", b: "10"}
            }, TEST_CONDITION.EQUALS, "14", "data");
    });

    it('int64Or: 85 | 170 = 255', async () => {
        await TEST_QUERY("### int64Or 85 | 170",
            contractHandler, {
                method: 'int64Or',
                params: {a: "85", b: "170"}
            }, TEST_CONDITION.EQUALS, "255", "data");
    });

    // ── int64 XOR ─────────────────────────────────────────────────────────────

    it('int64Xor: 12 ^ 10 = 6', async () => {
        await TEST_QUERY("### int64Xor 12 ^ 10",
            contractHandler, {
                method: 'int64Xor',
                params: {a: "12", b: "10"}
            }, TEST_CONDITION.EQUALS, "6", "data");
    });

    it('int64Xor: same value XOR = 0', async () => {
        await TEST_QUERY("### int64Xor same ^ same",
            contractHandler, {
                method: 'int64Xor',
                params: {a: "12345", b: "12345"}
            }, TEST_CONDITION.EQUALS, "0", "data");
    });

    // ── int64 NOT ─────────────────────────────────────────────────────────────

    it('int64Not: ~0 = -1', async () => {
        await TEST_QUERY("### int64Not ~0",
            contractHandler, {
                method: 'int64Not',
                params: {a: "0"}
            }, TEST_CONDITION.EQUALS, "-1", "data");
    });

    it('int64Not: ~(-1) = 0', async () => {
        await TEST_QUERY("### int64Not ~(-1)",
            contractHandler, {
                method: 'int64Not',
                params: {a: "-1"}
            }, TEST_CONDITION.EQUALS, "0", "data");
    });

    // ── int64 LShift ──────────────────────────────────────────────────────────

    it('int64LShift: 1 << 4 = 16', async () => {
        await TEST_QUERY("### int64LShift 1 << 4",
            contractHandler, {
                method: 'int64LShift',
                params: {a: "1", b: "4"}
            }, TEST_CONDITION.EQUALS, "16", "data");
    });

    it('int64LShift: 3 << 3 = 24', async () => {
        await TEST_QUERY("### int64LShift 3 << 3",
            contractHandler, {
                method: 'int64LShift',
                params: {a: "3", b: "3"}
            }, TEST_CONDITION.EQUALS, "24", "data");
    });

    // ── int64 RShift ──────────────────────────────────────────────────────────

    it('int64RShift: 64 >> 3 = 8', async () => {
        await TEST_QUERY("### int64RShift 64 >> 3",
            contractHandler, {
                method: 'int64RShift',
                params: {a: "64", b: "3"}
            }, TEST_CONDITION.EQUALS, "8", "data");
    });

    it('int64RShift: -8 >> 1 = -4 (arithmetic)', async () => {
        await TEST_QUERY("### int64RShift -8 >> 1",
            contractHandler, {
                method: 'int64RShift',
                params: {a: "-8", b: "1"}
            }, TEST_CONDITION.EQUALS, "-4", "data");
    });

    // ── uint64 RShift ─────────────────────────────────────────────────────────

    it('uint64RShift: 64 >>> 3 = 8', async () => {
        await TEST_QUERY("### uint64RShift 64 >>> 3",
            contractHandler, {
                method: 'uint64RShift',
                params: {a: "64", b: "3"}
            }, TEST_CONDITION.EQUALS, "8", "data");
    });

    it('uint64RShift: 256 >>> 4 = 16', async () => {
        await TEST_QUERY("### uint64RShift 256 >>> 4",
            contractHandler, {
                method: 'uint64RShift',
                params: {a: "256", b: "4"}
            }, TEST_CONDITION.EQUALS, "16", "data");
    });

    // ── int256 AND ────────────────────────────────────────────────────────────

    it('int256And: 255 & 170 = 170', async () => {
        await TEST_QUERY("### int256And 255 & 170",
            contractHandler, {
                method: 'int256And',
                params: {a: "255", b: "170"}
            }, TEST_CONDITION.EQUALS, "170", "data");
    });

    it('int256And: 0 & 999999 = 0', async () => {
        await TEST_QUERY("### int256And 0 & 999999",
            contractHandler, {
                method: 'int256And',
                params: {a: "0", b: "999999"}
            }, TEST_CONDITION.EQUALS, "0", "data");
    });

    // ── int256 OR ─────────────────────────────────────────────────────────────

    it('int256Or: 85 | 170 = 255', async () => {
        await TEST_QUERY("### int256Or 85 | 170",
            contractHandler, {
                method: 'int256Or',
                params: {a: "85", b: "170"}
            }, TEST_CONDITION.EQUALS, "255", "data");
    });

    // ── int256 XOR ────────────────────────────────────────────────────────────

    it('int256Xor: 255 ^ 170 = 85', async () => {
        await TEST_QUERY("### int256Xor 255 ^ 170",
            contractHandler, {
                method: 'int256Xor',
                params: {a: "255", b: "170"}
            }, TEST_CONDITION.EQUALS, "85", "data");
    });

    it('int256Xor: same value XOR = 0', async () => {
        await TEST_QUERY("### int256Xor same ^ same",
            contractHandler, {
                method: 'int256Xor',
                params: {a: "999999999", b: "999999999"}
            }, TEST_CONDITION.EQUALS, "0", "data");
    });

    // ── int256 NOT ────────────────────────────────────────────────────────────

    it('int256Not: ~0 = -1', async () => {
        await TEST_QUERY("### int256Not ~0",
            contractHandler, {
                method: 'int256Not',
                params: {a: "0"}
            }, TEST_CONDITION.EQUALS, "-1", "data");
    });

    it('int256Not: ~(-1) = 0', async () => {
        await TEST_QUERY("### int256Not ~(-1)",
            contractHandler, {
                method: 'int256Not',
                params: {a: "-1"}
            }, TEST_CONDITION.EQUALS, "0", "data");
    });

    // ── int256 LShift ─────────────────────────────────────────────────────────

    it('int256LShift: 1 << 8 = 256', async () => {
        await TEST_QUERY("### int256LShift 1 << 8",
            contractHandler, {
                method: 'int256LShift',
                params: {a: "1", b: "8"}
            }, TEST_CONDITION.EQUALS, "256", "data");
    });

    it('int256LShift: 100 << 4 = 1600', async () => {
        await TEST_QUERY("### int256LShift 100 << 4",
            contractHandler, {
                method: 'int256LShift',
                params: {a: "100", b: "4"}
            }, TEST_CONDITION.EQUALS, "1600", "data");
    });

    // ── int256 RShift ─────────────────────────────────────────────────────────

    it('int256RShift: 256 >> 4 = 16', async () => {
        await TEST_QUERY("### int256RShift 256 >> 4",
            contractHandler, {
                method: 'int256RShift',
                params: {a: "256", b: "4"}
            }, TEST_CONDITION.EQUALS, "16", "data");
    });

    it('int256RShift: -16 >> 2 = -4 (arithmetic)', async () => {
        await TEST_QUERY("### int256RShift -16 >> 2",
            contractHandler, {
                method: 'int256RShift',
                params: {a: "-16", b: "2"}
            }, TEST_CONDITION.EQUALS, "-4", "data");
    });

    // ── uint256 RShift ────────────────────────────────────────────────────────

    it('uint256RShift: 256 >>> 4 = 16', async () => {
        await TEST_QUERY("### uint256RShift 256 >>> 4",
            contractHandler, {
                method: 'uint256RShift',
                params: {a: "256", b: "4"}
            }, TEST_CONDITION.EQUALS, "16", "data");
    });

    it('uint256RShift: 1024 >>> 3 = 128', async () => {
        await TEST_QUERY("### uint256RShift 1024 >>> 3",
            contractHandler, {
                method: 'uint256RShift',
                params: {a: "1024", b: "3"}
            }, TEST_CONDITION.EQUALS, "128", "data");
    });
});

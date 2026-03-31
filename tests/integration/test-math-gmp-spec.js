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
    contractAddress: process.env.SPEC_MATH_GMP,
};

describe('Test contract math-gmp (native GMP built-ins)', function () {
    this.timeout(30000);

    // ── int256Pow ─────────────────────────────────────────────────────────────

    it('int256Pow: 10^2 = 100', async () => {
        await TEST_QUERY("### int256Pow 10^2",
            contractHandler, {method: 'pow', params: {base: "10", exp: "2"}},
            TEST_CONDITION.EQUALS, "100", "data");
    });

    it('int256Pow: 2^10 = 1024', async () => {
        await TEST_QUERY("### int256Pow 2^10",
            contractHandler, {method: 'pow', params: {base: "2", exp: "10"}},
            TEST_CONDITION.EQUALS, "1024", "data");
    });

    it('int256Pow: 3^3 = 27', async () => {
        await TEST_QUERY("### int256Pow 3^3",
            contractHandler, {method: 'pow', params: {base: "3", exp: "3"}},
            TEST_CONDITION.EQUALS, "27", "data");
    });

    it('int256Pow: any^0 = 1', async () => {
        await TEST_QUERY("### int256Pow any^0",
            contractHandler, {method: 'pow', params: {base: "99", exp: "0"}},
            TEST_CONDITION.EQUALS, "1", "data");
    });

    it('int256Pow: 0^5 = 0', async () => {
        await TEST_QUERY("### int256Pow 0^5",
            contractHandler, {method: 'pow', params: {base: "0", exp: "5"}},
            TEST_CONDITION.EQUALS, "0", "data");
    });

    it('int256Pow: 2^1 = 2 (exp=1 boundary)', async () => {
        await TEST_QUERY("### int256Pow 2^1",
            contractHandler, {method: 'pow', params: {base: "2", exp: "1"}},
            TEST_CONDITION.EQUALS, "2", "data");
    });

    it('int256Pow: (-1)^3 = -1 (negative base, odd exp)', async () => {
        await TEST_QUERY("### int256Pow (-1)^3",
            contractHandler, {method: 'pow', params: {base: "-1", exp: "3"}},
            TEST_CONDITION.EQUALS, "-1", "data");
    });

    // BLK-H01: exp=10000 is exactly at the cap — must succeed when result fits
    it('int256Pow: 1^10000 = 1 (at exp cap, BLK-H01)', async () => {
        await TEST_QUERY("### int256Pow 1^10000",
            contractHandler, {method: 'pow', params: {base: "1", exp: "10000"}},
            TEST_CONDITION.EQUALS, "1", "data");
    });

    // ── int256Sqrt ────────────────────────────────────────────────────────────

    it('int256Sqrt: sqrt(0) = 0', async () => {
        await TEST_QUERY("### int256Sqrt(0)",
            contractHandler, {method: 'sqrt', params: {x: "0"}},
            TEST_CONDITION.EQUALS, "0", "data");
    });

    it('int256Sqrt: sqrt(9) = 3', async () => {
        await TEST_QUERY("### int256Sqrt(9)",
            contractHandler, {method: 'sqrt', params: {x: "9"}},
            TEST_CONDITION.EQUALS, "3", "data");
    });

    it('int256Sqrt: sqrt(100) = 10', async () => {
        await TEST_QUERY("### int256Sqrt(100)",
            contractHandler, {method: 'sqrt', params: {x: "100"}},
            TEST_CONDITION.EQUALS, "10", "data");
    });

    it('int256Sqrt: sqrt(144) = 12', async () => {
        await TEST_QUERY("### int256Sqrt(144)",
            contractHandler, {method: 'sqrt', params: {x: "144"}},
            TEST_CONDITION.EQUALS, "12", "data");
    });

    it('int256Sqrt: sqrt(2) = 1 (floor)', async () => {
        await TEST_QUERY("### int256Sqrt(2) floor",
            contractHandler, {method: 'sqrt', params: {x: "2"}},
            TEST_CONDITION.EQUALS, "1", "data");
    });

    it('int256Sqrt: sqrt(10) = 3 (non-perfect floor)', async () => {
        await TEST_QUERY("### int256Sqrt(10) non-perfect",
            contractHandler, {method: 'sqrt', params: {x: "10"}},
            TEST_CONDITION.EQUALS, "3", "data");
    });

    it('int256Sqrt: sqrt(99) = 9 (non-perfect floor)', async () => {
        await TEST_QUERY("### int256Sqrt(99) non-perfect",
            contractHandler, {method: 'sqrt', params: {x: "99"}},
            TEST_CONDITION.EQUALS, "9", "data");
    });

    it('int256Sqrt: sqrt(10000000000) = 100000', async () => {
        await TEST_QUERY("### int256Sqrt(10000000000)",
            contractHandler, {method: 'sqrt', params: {x: "10000000000"}},
            TEST_CONDITION.EQUALS, "100000", "data");
    });

    // ── int256Min ─────────────────────────────────────────────────────────────

    it('int256Min: min(144, 122) = 122', async () => {
        await TEST_QUERY("### int256Min(144, 122)",
            contractHandler, {method: 'min', params: {x: "144", y: "122"}},
            TEST_CONDITION.EQUALS, "122", "data");
    });

    it('int256Min: min(0, 100) = 0', async () => {
        await TEST_QUERY("### int256Min(0, 100)",
            contractHandler, {method: 'min', params: {x: "0", y: "100"}},
            TEST_CONDITION.EQUALS, "0", "data");
    });

    it('int256Min: min(50, 50) = 50 (equal)', async () => {
        await TEST_QUERY("### int256Min(50, 50)",
            contractHandler, {method: 'min', params: {x: "50", y: "50"}},
            TEST_CONDITION.EQUALS, "50", "data");
    });

    it('int256Min: min negative values', async () => {
        await TEST_QUERY("### int256Min(-10, -5)",
            contractHandler, {method: 'min', params: {x: "-10", y: "-5"}},
            TEST_CONDITION.EQUALS, "-10", "data");
    });

    // ── int256Max ─────────────────────────────────────────────────────────────

    it('int256Max: max(144, 122) = 144', async () => {
        await TEST_QUERY("### int256Max(144, 122)",
            contractHandler, {method: 'max', params: {x: "144", y: "122"}},
            TEST_CONDITION.EQUALS, "144", "data");
    });

    it('int256Max: max(0, 100) = 100', async () => {
        await TEST_QUERY("### int256Max(0, 100)",
            contractHandler, {method: 'max', params: {x: "0", y: "100"}},
            TEST_CONDITION.EQUALS, "100", "data");
    });

    it('int256Max: max(50, 50) = 50 (equal)', async () => {
        await TEST_QUERY("### int256Max(50, 50)",
            contractHandler, {method: 'max', params: {x: "50", y: "50"}},
            TEST_CONDITION.EQUALS, "50", "data");
    });

    it('int256Max: max negative values', async () => {
        await TEST_QUERY("### int256Max(-10, -5)",
            contractHandler, {method: 'max', params: {x: "-10", y: "-5"}},
            TEST_CONDITION.EQUALS, "-5", "data");
    });
});

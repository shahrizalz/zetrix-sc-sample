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
    contractAddress: process.env.SPEC_MATH,
};

describe('Test contract math', function () {
    this.timeout(30000);

    // ── pow ───────────────────────────────────────────────────────────────────

    it('pow: 10^2 = 100', async () => {
        await TEST_QUERY("### pow 10^2",
            contractHandler, {
                method: 'pow',
                params: {base: "10", exp: "2"}
            }, TEST_CONDITION.EQUALS, "100", "data");
    });

    it('pow: 2^10 = 1024', async () => {
        await TEST_QUERY("### pow 2^10",
            contractHandler, {
                method: 'pow',
                params: {base: "2", exp: "10"}
            }, TEST_CONDITION.EQUALS, "1024", "data");
    });

    it('pow: 3^3 = 27', async () => {
        await TEST_QUERY("### pow 3^3",
            contractHandler, {
                method: 'pow',
                params: {base: "3", exp: "3"}
            }, TEST_CONDITION.EQUALS, "27", "data");
    });

    it('pow: any^0 = 1', async () => {
        await TEST_QUERY("### pow any^0",
            contractHandler, {
                method: 'pow',
                params: {base: "99", exp: "0"}
            }, TEST_CONDITION.EQUALS, 1, "data");
    });

    it('pow: 1^100 = 1', async () => {
        await TEST_QUERY("### pow 1^100",
            contractHandler, {
                method: 'pow',
                params: {base: "1", exp: "100"}
            }, TEST_CONDITION.EQUALS, "1", "data");
    });

    // ── sqrt ──────────────────────────────────────────────────────────────────

    it('sqrt: sqrt(144) = 12', async () => {
        await TEST_QUERY("### sqrt(144)",
            contractHandler, {
                method: 'sqrt',
                params: {x: "144"}
            }, TEST_CONDITION.EQUALS, "12", "data");
    });

    it('sqrt: sqrt(9) = 3', async () => {
        await TEST_QUERY("### sqrt(9)",
            contractHandler, {
                method: 'sqrt',
                params: {x: "9"}
            }, TEST_CONDITION.EQUALS, "3", "data");
    });

    it('sqrt: sqrt(100) = 10', async () => {
        await TEST_QUERY("### sqrt(100)",
            contractHandler, {
                method: 'sqrt',
                params: {x: "100"}
            }, TEST_CONDITION.EQUALS, "10", "data");
    });

    it('sqrt: sqrt(1) = 1', async () => {
        await TEST_QUERY("### sqrt(1)",
            contractHandler, {
                method: 'sqrt',
                params: {x: "1"}
            }, TEST_CONDITION.EQUALS, "1", "data");
    });

    // ── min ───────────────────────────────────────────────────────────────────

    it('min: min(144, 122) = 122', async () => {
        await TEST_QUERY("### min(144, 122)",
            contractHandler, {
                method: 'min',
                params: {x: "144", y: "122"}
            }, TEST_CONDITION.EQUALS, "122", "data");
    });

    it('min: min(0, 100) = 0', async () => {
        await TEST_QUERY("### min(0, 100)",
            contractHandler, {
                method: 'min',
                params: {x: "0", y: "100"}
            }, TEST_CONDITION.EQUALS, "0", "data");
    });

    it('min: min(equal, equal) = equal', async () => {
        await TEST_QUERY("### min(50, 50)",
            contractHandler, {
                method: 'min',
                params: {x: "50", y: "50"}
            }, TEST_CONDITION.EQUALS, "50", "data");
    });

    it('min: min(1, 999) = 1', async () => {
        await TEST_QUERY("### min(1, 999)",
            contractHandler, {
                method: 'min',
                params: {x: "1", y: "999"}
            }, TEST_CONDITION.EQUALS, "1", "data");
    });

    // ── max ───────────────────────────────────────────────────────────────────

    it('max: max(144, 122) = 144', async () => {
        await TEST_QUERY("### max(144, 122)",
            contractHandler, {
                method: 'max',
                params: {x: "144", y: "122"}
            }, TEST_CONDITION.EQUALS, "144", "data");
    });

    it('max: max(0, 100) = 100', async () => {
        await TEST_QUERY("### max(0, 100)",
            contractHandler, {
                method: 'max',
                params: {x: "0", y: "100"}
            }, TEST_CONDITION.EQUALS, "100", "data");
    });

    it('max: max(equal, equal) = equal', async () => {
        await TEST_QUERY("### max(50, 50)",
            contractHandler, {
                method: 'max',
                params: {x: "50", y: "50"}
            }, TEST_CONDITION.EQUALS, "50", "data");
    });

    it('max: max(1, 999) = 999', async () => {
        await TEST_QUERY("### max(1, 999)",
            contractHandler, {
                method: 'max',
                params: {x: "1", y: "999"}
            }, TEST_CONDITION.EQUALS, "999", "data");
    });
});

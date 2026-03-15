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
    contractAddress: process.env.SPEC_SAFE_MATH,
};

describe('Test contract safe-math (uint64 / uint256)', function () {
    this.timeout(30000);

    // ── uint64 ────────────────────────────────────────────────────────────────

    it('testing uint64Add function', async () => {
        await TEST_QUERY("### uint64Add function",
            contractHandler, {
                method: 'uint64Add',
                params: { x: '100', y: '200' }
            }, TEST_CONDITION.EQUALS, "300", "data");
    });

    it('testing uint64Sub function', async () => {
        await TEST_QUERY("### uint64Sub function",
            contractHandler, {
                method: 'uint64Sub',
                params: { x: '500', y: '300' }
            }, TEST_CONDITION.EQUALS, "200", "data");
    });

    it('testing uint64Mul function', async () => {
        await TEST_QUERY("### uint64Mul function",
            contractHandler, {
                method: 'uint64Mul',
                params: { x: '12', y: '12' }
            }, TEST_CONDITION.EQUALS, "144", "data");
    });

    it('testing uint64Div function', async () => {
        await TEST_QUERY("### uint64Div function",
            contractHandler, {
                method: 'uint64Div',
                params: { x: '144', y: '12' }
            }, TEST_CONDITION.EQUALS, "12", "data");
    });

    it('testing uint64Mod function', async () => {
        await TEST_QUERY("### uint64Mod function",
            contractHandler, {
                method: 'uint64Mod',
                params: { x: '100', y: '7' }
            }, TEST_CONDITION.EQUALS, "2", "data");
    });

    it('testing uint64Compare: greater', async () => {
        await TEST_QUERY("### uint64Compare greater",
            contractHandler, {
                method: 'uint64Compare',
                params: { x: '200', y: '100' }
            }, TEST_CONDITION.EQUALS, 1, "data");
    });

    it('testing uint64Compare: equal', async () => {
        await TEST_QUERY("### uint64Compare equal",
            contractHandler, {
                method: 'uint64Compare',
                params: { x: '100', y: '100' }
            }, TEST_CONDITION.EQUALS, 0, "data");
    });

    it('testing stoui64Check: valid uint64', async () => {
        await TEST_QUERY("### stoui64Check valid",
            contractHandler, {
                method: 'stoui64Check',
                params: { s: '18446744073709551615' }
            }, TEST_CONDITION.EQUALS, true, "data");
    });

    it('testing stoui64Check: negative value is invalid', async () => {
        await TEST_QUERY("### stoui64Check negative",
            contractHandler, {
                method: 'stoui64Check',
                params: { s: '-1' }
            }, TEST_CONDITION.EQUALS, false, "data");
    });

    // ── uint256 ───────────────────────────────────────────────────────────────

    it('testing uint256Add function', async () => {
        await TEST_QUERY("### uint256Add function",
            contractHandler, {
                method: 'uint256Add',
                params: { x: '999999999999999999', y: '1' }
            }, TEST_CONDITION.EQUALS, "1000000000000000000", "data");
    });

    it('testing uint256Sub function', async () => {
        await TEST_QUERY("### uint256Sub function",
            contractHandler, {
                method: 'uint256Sub',
                params: { x: '1000000000000000000', y: '1' }
            }, TEST_CONDITION.EQUALS, "999999999999999999", "data");
    });

    it('testing uint256Mul function', async () => {
        await TEST_QUERY("### uint256Mul function",
            contractHandler, {
                method: 'uint256Mul',
                params: { x: '1000000000', y: '1000000000' }
            }, TEST_CONDITION.EQUALS, "1000000000000000000", "data");
    });

    it('testing uint256Div function', async () => {
        await TEST_QUERY("### uint256Div function",
            contractHandler, {
                method: 'uint256Div',
                params: { x: '1000000000000000000', y: '1000000000' }
            }, TEST_CONDITION.EQUALS, "1000000000", "data");
    });

    it('testing uint256Mod function', async () => {
        await TEST_QUERY("### uint256Mod function",
            contractHandler, {
                method: 'uint256Mod',
                params: { x: '1000000000000000007', y: '10' }
            }, TEST_CONDITION.EQUALS, "7", "data");
    });

    it('testing uint256Compare: greater', async () => {
        await TEST_QUERY("### uint256Compare greater",
            contractHandler, {
                method: 'uint256Compare',
                params: { x: '1000000000000000001', y: '1000000000000000000' }
            }, TEST_CONDITION.EQUALS, 1, "data");
    });

    it('testing uint256Compare: equal', async () => {
        await TEST_QUERY("### uint256Compare equal",
            contractHandler, {
                method: 'uint256Compare',
                params: { x: '1000000000000000000', y: '1000000000000000000' }
            }, TEST_CONDITION.EQUALS, 0, "data");
    });

    it('testing stoui256Check: valid uint256', async () => {
        await TEST_QUERY("### stoui256Check valid",
            contractHandler, {
                method: 'stoui256Check',
                params: { s: '1000000000000000000' }
            }, TEST_CONDITION.EQUALS, true, "data");
    });

    it('testing stoui256Check: negative value is invalid', async () => {
        await TEST_QUERY("### stoui256Check negative",
            contractHandler, {
                method: 'stoui256Check',
                params: { s: '-999' }
            }, TEST_CONDITION.EQUALS, false, "data");
    });

    // ── uint256 boundary: values beyond int256 max (2^255 - 1) ───────────────
    // int256 max = 57896044618658097711785492504343953926634992332820282019728792003956564819967
    // uint256 max = 115792089237316195423570985008687907853269984665640564039457584007913129639935

    it('testing uint256Add: int256Max + 1 crosses into uint256-only territory', async () => {
        await TEST_QUERY("### uint256Add beyond int256Max",
            contractHandler, {
                method: 'uint256Add',
                params: {
                    x: '57896044618658097711785492504343953926634992332820282019728792003956564819967',
                    y: '1'
                }
            }, TEST_CONDITION.EQUALS, "57896044618658097711785492504343953926634992332820282019728792003956564819968", "data");
    });

    it('testing uint256Sub: uint256Max - 1 stays within valid uint256 range', async () => {
        await TEST_QUERY("### uint256Sub at uint256Max",
            contractHandler, {
                method: 'uint256Sub',
                params: {
                    x: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                    y: '1'
                }
            }, TEST_CONDITION.EQUALS, "115792089237316195423570985008687907853269984665640564039457584007913129639934", "data");
    });

    it('testing uint256Compare: value above int256Max is greater than int256Max', async () => {
        await TEST_QUERY("### uint256Compare across int256 boundary",
            contractHandler, {
                method: 'uint256Compare',
                params: {
                    x: '57896044618658097711785492504343953926634992332820282019728792003956564819968',
                    y: '57896044618658097711785492504343953926634992332820282019728792003956564819967'
                }
            }, TEST_CONDITION.EQUALS, 1, "data");
    });

    it('testing stoui256Check: uint256Max is valid', async () => {
        await TEST_QUERY("### stoui256Check uint256Max",
            contractHandler, {
                method: 'stoui256Check',
                params: { s: '115792089237316195423570985008687907853269984665640564039457584007913129639935' }
            }, TEST_CONDITION.EQUALS, true, "data");
    });

    it('testing stoui256Check: value exceeding uint256Max is invalid', async () => {
        await TEST_QUERY("### stoui256Check overflow uint256Max",
            contractHandler, {
                method: 'stoui256Check',
                params: { s: '115792089237316195423570985008687907853269984665640564039457584007913129639936' }
            }, TEST_CONDITION.EQUALS, false, "data");
    });
});

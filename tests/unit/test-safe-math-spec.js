const {expect} = require("chai");
const Utils = require("./mock/utils.js");
const loader = require("./utils/loader");

let query, main, init;

describe('Test contract safe-math (uint64 / uint256)', function () {
    this.timeout(30000);

    before(async function () {
        const module = await loader('./contracts/', 'specs/safe-math-spec.js');
        query = module.default.query;
        main  = module.default.main;
        init  = module.default.init;
        init();
    });

    // ── uint64 ────────────────────────────────────────────────────────────────

    it('uint64Add: 100 + 200 = 300', async () => {
        let result = query(JSON.stringify({ method: 'uint64Add', params: { x: '100', y: '200' } }));
        expect(JSON.parse(result).data).to.equal('300');
    });

    it('uint64Sub: 500 - 300 = 200', async () => {
        let result = query(JSON.stringify({ method: 'uint64Sub', params: { x: '500', y: '300' } }));
        expect(JSON.parse(result).data).to.equal('200');
    });

    it('uint64Mul: 12 * 12 = 144', async () => {
        let result = query(JSON.stringify({ method: 'uint64Mul', params: { x: '12', y: '12' } }));
        expect(JSON.parse(result).data).to.equal('144');
    });

    it('uint64Div: 144 / 12 = 12', async () => {
        let result = query(JSON.stringify({ method: 'uint64Div', params: { x: '144', y: '12' } }));
        expect(JSON.parse(result).data).to.equal('12');
    });

    it('uint64Mod: 100 % 7 = 2', async () => {
        let result = query(JSON.stringify({ method: 'uint64Mod', params: { x: '100', y: '7' } }));
        expect(JSON.parse(result).data).to.equal('2');
    });

    it('uint64Compare: 200 > 100 returns 1', async () => {
        let result = query(JSON.stringify({ method: 'uint64Compare', params: { x: '200', y: '100' } }));
        expect(JSON.parse(result).data).to.equal(1);
    });

    it('uint64Compare: 100 < 200 returns -1', async () => {
        let result = query(JSON.stringify({ method: 'uint64Compare', params: { x: '100', y: '200' } }));
        expect(JSON.parse(result).data).to.equal(-1);
    });

    it('uint64Compare: 100 == 100 returns 0', async () => {
        let result = query(JSON.stringify({ method: 'uint64Compare', params: { x: '100', y: '100' } }));
        expect(JSON.parse(result).data).to.equal(0);
    });

    it('stoui64Check: valid uint64 string returns true', async () => {
        let result = query(JSON.stringify({ method: 'stoui64Check', params: { s: '18446744073709551615' } }));
        expect(JSON.parse(result).data).to.equal(true);
    });

    it('stoui64Check: negative string returns false', async () => {
        let result = query(JSON.stringify({ method: 'stoui64Check', params: { s: '-1' } }));
        expect(JSON.parse(result).data).to.equal(false);
    });

    // ── uint256 ───────────────────────────────────────────────────────────────

    it('uint256Add: large values add correctly', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Add',
            params: { x: '999999999999999999', y: '1' }
        }));
        expect(JSON.parse(result).data).to.equal('1000000000000000000');
    });

    it('uint256Sub: large values subtract correctly', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Sub',
            params: { x: '1000000000000000000', y: '1' }
        }));
        expect(JSON.parse(result).data).to.equal('999999999999999999');
    });

    it('uint256Mul: 1000000000 * 1000000000 = 1000000000000000000', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Mul',
            params: { x: '1000000000', y: '1000000000' }
        }));
        expect(JSON.parse(result).data).to.equal('1000000000000000000');
    });

    it('uint256Div: 1000000000000000000 / 1000000000 = 1000000000', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Div',
            params: { x: '1000000000000000000', y: '1000000000' }
        }));
        expect(JSON.parse(result).data).to.equal('1000000000');
    });

    it('uint256Mod: 1000000000000000007 % 10 = 7', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Mod',
            params: { x: '1000000000000000007', y: '10' }
        }));
        expect(JSON.parse(result).data).to.equal('7');
    });

    it('uint256Compare: larger value returns 1', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Compare',
            params: { x: '1000000000000000001', y: '1000000000000000000' }
        }));
        expect(JSON.parse(result).data).to.equal(1);
    });

    it('uint256Compare: equal values return 0', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Compare',
            params: { x: '1000000000000000000', y: '1000000000000000000' }
        }));
        expect(JSON.parse(result).data).to.equal(0);
    });

    it('stoui256Check: valid uint256 string returns true', async () => {
        let result = query(JSON.stringify({ method: 'stoui256Check', params: { s: '1000000000000000000' } }));
        expect(JSON.parse(result).data).to.equal(true);
    });

    it('stoui256Check: negative string returns false', async () => {
        let result = query(JSON.stringify({ method: 'stoui256Check', params: { s: '-999' } }));
        expect(JSON.parse(result).data).to.equal(false);
    });

    // ── uint256 boundary: values beyond int256 max (2^255 - 1) ───────────────
    // int256 max = 57896044618658097711785492504343953926634992332820282019728792003956564819967
    // uint256 max = 115792089237316195423570985008687907853269984665640564039457584007913129639935

    it('uint256Add: int256Max + 1 crosses into uint256-only territory', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Add',
            params: {
                x: '57896044618658097711785492504343953926634992332820282019728792003956564819967',
                y: '1'
            }
        }));
        expect(JSON.parse(result).data).to.equal('57896044618658097711785492504343953926634992332820282019728792003956564819968');
    });

    it('uint256Sub: uint256Max - 1 stays within valid uint256 range', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Sub',
            params: {
                x: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                y: '1'
            }
        }));
        expect(JSON.parse(result).data).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639934');
    });

    it('uint256Mul: (int256Max + 1) * 2 = uint256Max + 1 is out of range (sanity check on large mul)', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Mul',
            params: {
                x: '57896044618658097711785492504343953926634992332820282019728792003956564819968',
                y: '2'
            }
        }));
        expect(JSON.parse(result).data).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639936');
    });

    it('uint256Compare: value above int256Max is greater than int256Max', async () => {
        let result = query(JSON.stringify({
            method: 'uint256Compare',
            params: {
                x: '57896044618658097711785492504343953926634992332820282019728792003956564819968',
                y: '57896044618658097711785492504343953926634992332820282019728792003956564819967'
            }
        }));
        expect(JSON.parse(result).data).to.equal(1);
    });

    it('stoui256Check: uint256Max is valid', async () => {
        let result = query(JSON.stringify({
            method: 'stoui256Check',
            params: { s: '115792089237316195423570985008687907853269984665640564039457584007913129639935' }
        }));
        expect(JSON.parse(result).data).to.equal(true);
    });

    it('stoui256Check: value exceeding uint256Max is invalid', async () => {
        let result = query(JSON.stringify({
            method: 'stoui256Check',
            params: { s: '115792089237316195423570985008687907853269984665640564039457584007913129639936' }
        }));
        expect(JSON.parse(result).data).to.equal(false);
    });
});

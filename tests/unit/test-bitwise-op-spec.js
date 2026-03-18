const {expect} = require("chai");
const loader = require("./utils/loader");

let query, main, init;

describe('Test contract bitwise-op', function () {
    this.timeout(30000);

    before(async function () {
        const module = await loader('./contracts/', 'specs/bitwise-op-spec.js');
        query = module.default.query;
        main = module.default.main;
        init = module.default.init;
        init();
    });

    // ── int64 AND ─────────────────────────────────────────────────────────────

    it('int64And: 12 & 10 = 8', async () => {
        let input = {method: 'int64And', params: {a: "12", b: "10"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("8");
    });

    it('int64And: 0 & 255 = 0', async () => {
        let input = {method: 'int64And', params: {a: "0", b: "255"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    it('int64And: 255 & 255 = 255', async () => {
        let input = {method: 'int64And', params: {a: "255", b: "255"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("255");
    });

    // ── int64 OR ──────────────────────────────────────────────────────────────

    it('int64Or: 12 | 10 = 14', async () => {
        let input = {method: 'int64Or', params: {a: "12", b: "10"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("14");
    });

    it('int64Or: 85 | 170 = 255', async () => {
        let input = {method: 'int64Or', params: {a: "85", b: "170"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("255");
    });

    it('int64Or: 0 | 0 = 0', async () => {
        let input = {method: 'int64Or', params: {a: "0", b: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    // ── int64 XOR ─────────────────────────────────────────────────────────────

    it('int64Xor: 12 ^ 10 = 6', async () => {
        let input = {method: 'int64Xor', params: {a: "12", b: "10"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("6");
    });

    it('int64Xor: 255 ^ 170 = 85', async () => {
        let input = {method: 'int64Xor', params: {a: "255", b: "170"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("85");
    });

    it('int64Xor: same value XOR = 0', async () => {
        let input = {method: 'int64Xor', params: {a: "12345", b: "12345"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    // ── int64 NOT ─────────────────────────────────────────────────────────────

    it('int64Not: ~0 = -1', async () => {
        let input = {method: 'int64Not', params: {a: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-1");
    });

    it('int64Not: ~(-1) = 0', async () => {
        let input = {method: 'int64Not', params: {a: "-1"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    it('int64Not: ~1 = -2', async () => {
        let input = {method: 'int64Not', params: {a: "1"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-2");
    });

    // ── int64 LShift ──────────────────────────────────────────────────────────

    it('int64LShift: 1 << 4 = 16', async () => {
        let input = {method: 'int64LShift', params: {a: "1", b: "4"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("16");
    });

    it('int64LShift: 1 << 0 = 1', async () => {
        let input = {method: 'int64LShift', params: {a: "1", b: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int64LShift: 3 << 3 = 24', async () => {
        let input = {method: 'int64LShift', params: {a: "3", b: "3"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("24");
    });

    // ── int64 RShift ──────────────────────────────────────────────────────────

    it('int64RShift: 64 >> 3 = 8', async () => {
        let input = {method: 'int64RShift', params: {a: "64", b: "3"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("8");
    });

    it('int64RShift: 1 >> 0 = 1', async () => {
        let input = {method: 'int64RShift', params: {a: "1", b: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int64RShift: -8 >> 1 = -4 (arithmetic, sign-preserved)', async () => {
        let input = {method: 'int64RShift', params: {a: "-8", b: "1"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-4");
    });

    // ── uint64 RShift ─────────────────────────────────────────────────────────

    it('uint64RShift: 64 >>> 3 = 8', async () => {
        let input = {method: 'uint64RShift', params: {a: "64", b: "3"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("8");
    });

    it('uint64RShift: 256 >>> 4 = 16', async () => {
        let input = {method: 'uint64RShift', params: {a: "256", b: "4"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("16");
    });

    // ── int256 AND ────────────────────────────────────────────────────────────

    it('int256And: 255 & 170 = 170', async () => {
        let input = {method: 'int256And', params: {a: "255", b: "170"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("170");
    });

    it('int256And: 0 & 999999 = 0', async () => {
        let input = {method: 'int256And', params: {a: "0", b: "999999"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    // ── int256 OR ─────────────────────────────────────────────────────────────

    it('int256Or: 85 | 170 = 255', async () => {
        let input = {method: 'int256Or', params: {a: "85", b: "170"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("255");
    });

    it('int256Or: 0 | 0 = 0', async () => {
        let input = {method: 'int256Or', params: {a: "0", b: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    // ── int256 XOR ────────────────────────────────────────────────────────────

    it('int256Xor: 255 ^ 170 = 85', async () => {
        let input = {method: 'int256Xor', params: {a: "255", b: "170"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("85");
    });

    it('int256Xor: same value XOR = 0', async () => {
        let input = {method: 'int256Xor', params: {a: "999999999", b: "999999999"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    // ── int256 NOT ────────────────────────────────────────────────────────────

    it('int256Not: ~0 = -1', async () => {
        let input = {method: 'int256Not', params: {a: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-1");
    });

    it('int256Not: ~(-1) = 0', async () => {
        let input = {method: 'int256Not', params: {a: "-1"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    it('int256Not: ~1 = -2', async () => {
        let input = {method: 'int256Not', params: {a: "1"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-2");
    });

    // ── int256 LShift ─────────────────────────────────────────────────────────

    it('int256LShift: 1 << 8 = 256', async () => {
        let input = {method: 'int256LShift', params: {a: "1", b: "8"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("256");
    });

    it('int256LShift: 1 << 0 = 1', async () => {
        let input = {method: 'int256LShift', params: {a: "1", b: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int256LShift: 100 << 4 = 1600', async () => {
        let input = {method: 'int256LShift', params: {a: "100", b: "4"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1600");
    });

    // ── int256 RShift ─────────────────────────────────────────────────────────

    it('int256RShift: 256 >> 4 = 16', async () => {
        let input = {method: 'int256RShift', params: {a: "256", b: "4"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("16");
    });

    it('int256RShift: 1024 >> 0 = 1024', async () => {
        let input = {method: 'int256RShift', params: {a: "1024", b: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1024");
    });

    it('int256RShift: -16 >> 2 = -4 (arithmetic, sign-preserved)', async () => {
        let input = {method: 'int256RShift', params: {a: "-16", b: "2"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-4");
    });

    // ── uint256 RShift ────────────────────────────────────────────────────────

    it('uint256RShift: 256 >>> 4 = 16', async () => {
        let input = {method: 'uint256RShift', params: {a: "256", b: "4"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("16");
    });

    it('uint256RShift: 1024 >>> 3 = 128', async () => {
        let input = {method: 'uint256RShift', params: {a: "1024", b: "3"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("128");
    });
});

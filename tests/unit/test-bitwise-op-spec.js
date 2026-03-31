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

    it('int64Not: ~INT64_MAX = INT64_MIN', async () => {
        let input = {method: 'int64Not', params: {a: "9223372036854775807"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-9223372036854775808");
    });

    it('int64Not: ~INT64_MIN = INT64_MAX', async () => {
        let input = {method: 'int64Not', params: {a: "-9223372036854775808"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("9223372036854775807");
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

    // BLK-C01: 1 << 63 wraps to INT64_MIN via unsigned shift
    it('int64LShift: 1 << 63 = INT64_MIN (BLK-C01 unsigned-shift fix)', async () => {
        let input = {method: 'int64LShift', params: {a: "1", b: "63"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-9223372036854775808");
    });

    it('int64LShift: -1 << 1 = -2 (negative input)', async () => {
        let input = {method: 'int64LShift', params: {a: "-1", b: "1"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-2");
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

    // BLK-M01: arithmetic right shift of -1 by max shift must stay -1 (sign-extending)
    it('int64RShift: -1 >> 63 = -1 (BLK-M01 arithmetic shift)', async () => {
        let input = {method: 'int64RShift', params: {a: "-1", b: "63"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-1");
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

    // ── int256 NOT ────────────────────────────────────────────────────────────

    it('int256Not: ~INT256_MAX = INT256_MIN', async () => {
        let input = {method: 'int256Not', params: {a: "57896044618658097711785492504343953926634992332820282019728792003956564819967"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-57896044618658097711785492504343953926634992332820282019728792003956564819968");
    });

    it('int256Not: ~INT256_MIN = INT256_MAX', async () => {
        let input = {method: 'int256Not', params: {a: "-57896044618658097711785492504343953926634992332820282019728792003956564819968"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("57896044618658097711785492504343953926634992332820282019728792003956564819967");
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

    // BLK-C02: 1 << 254 = 2^254, within range (check_size must accept)
    // Note: 1 << 255 = 2^255 > INT256_MAX and throws on-chain — only testable in integration
    it('int256LShift: 1 << 254 = 2^254 (BLK-C02 non-overflow boundary)', async () => {
        let input = {method: 'int256LShift', params: {a: "1", b: "254"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("28948022309329048855892746252171976963317496166410141009864396001978282409984");
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

    it('int256RShift: -1 >> 255 = -1 (max shift, arithmetic)', async () => {
        let input = {method: 'int256RShift', params: {a: "-1", b: "255"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("-1");
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

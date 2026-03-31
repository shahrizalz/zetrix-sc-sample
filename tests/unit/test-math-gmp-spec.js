const {expect} = require("chai");
const loader = require("./utils/loader");

let query, main, init;

describe('Test contract math-gmp (native GMP built-ins)', function () {
    this.timeout(30000);

    before(async function () {
        const module = await loader('./contracts/', 'specs/math-gmp-spec.js');
        query = module.default.query;
        main = module.default.main;
        init = module.default.init;
        init();
    });

    // ── int256Pow ─────────────────────────────────────────────────────────────

    it('int256Pow: 10^2 = 100', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "10", exp: "2"}}));
        expect(JSON.parse(result).data).to.equal("100");
    });

    it('int256Pow: 2^10 = 1024', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "2", exp: "10"}}));
        expect(JSON.parse(result).data).to.equal("1024");
    });

    it('int256Pow: 3^3 = 27', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "3", exp: "3"}}));
        expect(JSON.parse(result).data).to.equal("27");
    });

    it('int256Pow: any^0 = 1', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "99", exp: "0"}}));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int256Pow: 1^100 = 1', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "1", exp: "100"}}));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int256Pow: 0^5 = 0', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "0", exp: "5"}}));
        expect(JSON.parse(result).data).to.equal("0");
    });

    it('int256Pow: 2^1 = 2 (exp=1 boundary)', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "2", exp: "1"}}));
        expect(JSON.parse(result).data).to.equal("2");
    });

    it('int256Pow: (-1)^3 = -1 (negative base, odd exp)', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "-1", exp: "3"}}));
        expect(JSON.parse(result).data).to.equal("-1");
    });

    it('int256Pow: (-2)^2 = 4 (negative base, even exp)', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "-2", exp: "2"}}));
        expect(JSON.parse(result).data).to.equal("4");
    });

    // BLK-H01: exp=10000 is exactly at the cap — must succeed when result fits
    it('int256Pow: 1^10000 = 1 (at exp cap, BLK-H01)', async () => {
        let result = query(JSON.stringify({method: 'pow', params: {base: "1", exp: "10000"}}));
        expect(JSON.parse(result).data).to.equal("1");
    });

    // ── int256Sqrt ────────────────────────────────────────────────────────────

    it('int256Sqrt: sqrt(0) = 0', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "0"}}));
        expect(JSON.parse(result).data).to.equal("0");
    });

    it('int256Sqrt: sqrt(1) = 1', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "1"}}));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int256Sqrt: sqrt(9) = 3', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "9"}}));
        expect(JSON.parse(result).data).to.equal("3");
    });

    it('int256Sqrt: sqrt(100) = 10', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "100"}}));
        expect(JSON.parse(result).data).to.equal("10");
    });

    it('int256Sqrt: sqrt(144) = 12', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "144"}}));
        expect(JSON.parse(result).data).to.equal("12");
    });

    it('int256Sqrt: sqrt(2) = 1 (floor)', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "2"}}));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int256Sqrt: sqrt(10) = 3 (non-perfect floor)', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "10"}}));
        expect(JSON.parse(result).data).to.equal("3");
    });

    it('int256Sqrt: sqrt(99) = 9 (non-perfect floor, 9^2=81 < 99 < 100=10^2)', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "99"}}));
        expect(JSON.parse(result).data).to.equal("9");
    });

    it('int256Sqrt: sqrt(10000000000) = 100000', async () => {
        let result = query(JSON.stringify({method: 'sqrt', params: {x: "10000000000"}}));
        expect(JSON.parse(result).data).to.equal("100000");
    });

    // ── int256Min ─────────────────────────────────────────────────────────────

    it('int256Min: min(144, 122) = 122', async () => {
        let result = query(JSON.stringify({method: 'min', params: {x: "144", y: "122"}}));
        expect(JSON.parse(result).data).to.equal("122");
    });

    it('int256Min: min(0, 100) = 0', async () => {
        let result = query(JSON.stringify({method: 'min', params: {x: "0", y: "100"}}));
        expect(JSON.parse(result).data).to.equal("0");
    });

    it('int256Min: min(50, 50) = 50 (equal)', async () => {
        let result = query(JSON.stringify({method: 'min', params: {x: "50", y: "50"}}));
        expect(JSON.parse(result).data).to.equal("50");
    });

    it('int256Min: min(1, 999) = 1', async () => {
        let result = query(JSON.stringify({method: 'min', params: {x: "1", y: "999"}}));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('int256Min: min negative values', async () => {
        let result = query(JSON.stringify({method: 'min', params: {x: "-10", y: "-5"}}));
        expect(JSON.parse(result).data).to.equal("-10");
    });

    // ── int256Max ─────────────────────────────────────────────────────────────

    it('int256Max: max(144, 122) = 144', async () => {
        let result = query(JSON.stringify({method: 'max', params: {x: "144", y: "122"}}));
        expect(JSON.parse(result).data).to.equal("144");
    });

    it('int256Max: max(0, 100) = 100', async () => {
        let result = query(JSON.stringify({method: 'max', params: {x: "0", y: "100"}}));
        expect(JSON.parse(result).data).to.equal("100");
    });

    it('int256Max: max(50, 50) = 50 (equal)', async () => {
        let result = query(JSON.stringify({method: 'max', params: {x: "50", y: "50"}}));
        expect(JSON.parse(result).data).to.equal("50");
    });

    it('int256Max: max(1, 999) = 999', async () => {
        let result = query(JSON.stringify({method: 'max', params: {x: "1", y: "999"}}));
        expect(JSON.parse(result).data).to.equal("999");
    });

    it('int256Max: max negative values', async () => {
        let result = query(JSON.stringify({method: 'max', params: {x: "-10", y: "-5"}}));
        expect(JSON.parse(result).data).to.equal("-5");
    });
});

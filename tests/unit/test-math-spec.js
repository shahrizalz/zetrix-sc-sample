const {expect} = require("chai");
const sinon = require("sinon");
const Utils = require("./mock/utils.js");
const loader = require("./utils/loader");

let query, main, init;

describe('Test contract math', function () {
    this.timeout(30000);

    before(async function () {
        const module = await loader('./contracts/', 'specs/math-spec.js');
        query = module.default.query;
        main = module.default.main;
        init = module.default.init;
        init();
    });

    // ── pow ───────────────────────────────────────────────────────────────────

    it('pow: 10^2 = 100', async () => {
        const spy = sinon.spy(Utils, "int256Mul");
        let input = {method: 'pow', params: {base: "10", exp: "2"}};
        let result = query(JSON.stringify(input));
        expect(spy.callCount).to.equal(2);
        expect(JSON.parse(result).data).to.equal("100");
        spy.restore();
    });

    it('pow: 2^10 = 1024', async () => {
        let input = {method: 'pow', params: {base: "2", exp: "10"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1024");
    });

    it('pow: 3^3 = 27', async () => {
        let input = {method: 'pow', params: {base: "3", exp: "3"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("27");
    });

    it('pow: any^0 = 1', async () => {
        let input = {method: 'pow', params: {base: "99", exp: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1");
    });

    it('pow: 1^100 = 1', async () => {
        let input = {method: 'pow', params: {base: "1", exp: "100"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1");
    });

    // ── sqrt ──────────────────────────────────────────────────────────────────

    it('sqrt: sqrt(144) = 12', async () => {
        let input = {method: 'sqrt', params: {x: "144"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("12");
    });

    it('sqrt: sqrt(9) = 3', async () => {
        let input = {method: 'sqrt', params: {x: "9"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("3");
    });

    it('sqrt: sqrt(100) = 10', async () => {
        let input = {method: 'sqrt', params: {x: "100"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("10");
    });

    it('sqrt: sqrt(0) = 0', async () => {
        let input = {method: 'sqrt', params: {x: "0"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal(0);
    });

    it('sqrt: sqrt(1) = 1', async () => {
        let input = {method: 'sqrt', params: {x: "1"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1");
    });

    // ── min ───────────────────────────────────────────────────────────────────

    it('min: min(144, 122) = 122', async () => {
        let input = {method: 'min', params: {x: "144", y: "122"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("122");
    });

    it('min: min(0, 100) = 0', async () => {
        let input = {method: 'min', params: {x: "0", y: "100"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("0");
    });

    it('min: min(equal, equal) = equal', async () => {
        let input = {method: 'min', params: {x: "50", y: "50"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("50");
    });

    it('min: min(1, 999) = 1', async () => {
        let input = {method: 'min', params: {x: "1", y: "999"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("1");
    });

    // ── max ───────────────────────────────────────────────────────────────────

    it('max: max(144, 122) = 144', async () => {
        let input = {method: 'max', params: {x: "144", y: "122"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("144");
    });

    it('max: max(0, 100) = 100', async () => {
        let input = {method: 'max', params: {x: "0", y: "100"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("100");
    });

    it('max: max(equal, equal) = equal', async () => {
        let input = {method: 'max', params: {x: "50", y: "50"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("50");
    });

    it('max: max(1, 999) = 999', async () => {
        let input = {method: 'max', params: {x: "1", y: "999"}};
        let result = query(JSON.stringify(input));
        expect(JSON.parse(result).data).to.equal("999");
    });
});

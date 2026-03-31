const {expect} = require("chai");
const sinon = require("sinon");
const Utils = require("./mock/utils.js");
const loader = require("./utils/loader");

let query, main, init;

describe('Test contract ec (BLS12-381)', function () {
    this.timeout(30000);

    before(async function () {
        const module = await loader('./contracts/', 'specs/ec-spec.js');
        query = module.default.query;
        main = module.default.main;
        init = module.default.init;
        init();
    });

    // ── ecAdd ─────────────────────────────────────────────────────────────────

    it('ecAdd: routes to Utils.ecAdd and returns result', async () => {
        const spy = sinon.spy(Utils, "ecAdd");
        const p1 = "aabbcc";
        const p2 = "ddeeff";
        let input = {method: 'ecAdd', params: {p1, p2}};
        let result = query(JSON.stringify(input));
        expect(spy.callCount).to.equal(1);
        expect(spy.calledWith(p1, p2)).to.equal(true);
        expect(JSON.parse(result).data).to.equal("ec_add_result");
        spy.restore();
    });

    // ── ecMul ─────────────────────────────────────────────────────────────────

    it('ecMul: routes to Utils.ecMul and returns result', async () => {
        const spy = sinon.spy(Utils, "ecMul");
        const p = "aabbcc";
        const scalar = "02";
        let input = {method: 'ecMul', params: {p, scalar}};
        let result = query(JSON.stringify(input));
        expect(spy.callCount).to.equal(1);
        expect(spy.calledWith(p, scalar)).to.equal(true);
        expect(JSON.parse(result).data).to.equal("ec_mul_result");
        spy.restore();
    });

    // ── ecInv ─────────────────────────────────────────────────────────────────

    it('ecInv: routes to Utils.ecInv and returns result', async () => {
        const spy = sinon.spy(Utils, "ecInv");
        const p = "aabbcc";
        let input = {method: 'ecInv', params: {p}};
        let result = query(JSON.stringify(input));
        expect(spy.callCount).to.equal(1);
        expect(spy.calledWith(p)).to.equal(true);
        expect(JSON.parse(result).data).to.equal("ec_inv_result");
        spy.restore();
    });

    // ── ecDouble ──────────────────────────────────────────────────────────────

    it('ecDouble: routes to Utils.ecDouble and returns result', async () => {
        const spy = sinon.spy(Utils, "ecDouble");
        const p = "aabbcc";
        let input = {method: 'ecDouble', params: {p}};
        let result = query(JSON.stringify(input));
        expect(spy.callCount).to.equal(1);
        expect(spy.calledWith(p)).to.equal(true);
        expect(JSON.parse(result).data).to.equal("ec_double_result");
        spy.restore();
    });

    // ── ecPairing ─────────────────────────────────────────────────────────────

    it('ecPairing: routes to Utils.ecPairing and returns result', async () => {
        const spy = sinon.spy(Utils, "ecPairing");
        const p1 = "aabbcc";
        const p2 = "ddeeff";
        let input = {method: 'ecPairing', params: {p1, p2}};
        let result = query(JSON.stringify(input));
        expect(spy.callCount).to.equal(1);
        expect(spy.calledWith(p1, p2)).to.equal(true);
        expect(JSON.parse(result).data).to.equal("ec_pairing_result");
        spy.restore();
    });
});

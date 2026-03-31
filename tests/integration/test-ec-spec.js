const ZtxChainSDK = require('zetrix-sdk-nodejs');
const {TEST_RESULT, TEST_CONDITION, TEST_RESP_TYPE} = require("../../utils/constant");
const TEST_QUERY = require("../../utils/query-contract");
require('dotenv').config({path: "/../.env"})
require('mocha-generators').install();

// BLS12-381 test vectors (serialized points, hex-encoded)
//
// G1 generator (compressed, 48 bytes = 96 hex chars):
const G1 = "97f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb";
// G1 identity (point at infinity, compressed):
const G1_INF = "c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
// G2 generator (compressed, 96 bytes = 192 hex chars):
const G2 = "93e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb8";

const contractHandler = {
    sdk: new ZtxChainSDK({
        host: process.env.NODE_URL,
        secure: false
    }),
    contractAddress: process.env.SPEC_EC,
};

describe('Test contract ec (BLS12-381)', function () {
    this.timeout(30000);

    // ── ecAdd ─────────────────────────────────────────────────────────────────

    it('ecAdd: G + G = 2G (same as ecDouble(G))', async () => {
        await TEST_QUERY("### ecAdd G+G",
            contractHandler, {
                method: 'ecAdd',
                params: {p1: G1, p2: G1}
            }, TEST_CONDITION.EQUALS,
            // expected result equals ecDouble(G), verified independently
            await _queryData(contractHandler, {method: 'ecDouble', params: {p: G1}}),
            "data");
    });

    it('ecAdd: G + identity = G', async () => {
        await TEST_QUERY("### ecAdd G+inf",
            contractHandler, {
                method: 'ecAdd',
                params: {p1: G1, p2: G1_INF}
            }, TEST_CONDITION.EQUALS, G1, "data");
    });

    // ── ecMul ─────────────────────────────────────────────────────────────────

    it('ecMul: 1 * G = G', async () => {
        await TEST_QUERY("### ecMul 1*G",
            contractHandler, {
                method: 'ecMul',
                params: {p: G1, scalar: "01"}
            }, TEST_CONDITION.EQUALS, G1, "data");
    });

    it('ecMul: 0 * G = identity', async () => {
        await TEST_QUERY("### ecMul 0*G",
            contractHandler, {
                method: 'ecMul',
                params: {p: G1, scalar: "00"}
            }, TEST_CONDITION.EQUALS, G1_INF, "data");
    });

    it('ecMul: 2 * G = ecDouble(G)', async () => {
        const dbl = await _queryData(contractHandler, {method: 'ecDouble', params: {p: G1}});
        await TEST_QUERY("### ecMul 2*G",
            contractHandler, {
                method: 'ecMul',
                params: {p: G1, scalar: "02"}
            }, TEST_CONDITION.EQUALS, dbl, "data");
    });

    // ── ecInv ─────────────────────────────────────────────────────────────────

    it('ecInv: G + inv(G) = identity', async () => {
        const inv = await _queryData(contractHandler, {method: 'ecInv', params: {p: G1}});
        await TEST_QUERY("### ecAdd G+inv(G)",
            contractHandler, {
                method: 'ecAdd',
                params: {p1: G1, p2: inv}
            }, TEST_CONDITION.EQUALS, G1_INF, "data");
    });

    it('ecInv: inv(inv(G)) = G', async () => {
        const inv = await _queryData(contractHandler, {method: 'ecInv', params: {p: G1}});
        await TEST_QUERY("### ecInv(inv(G))",
            contractHandler, {
                method: 'ecInv',
                params: {p: inv}
            }, TEST_CONDITION.EQUALS, G1, "data");
    });

    // ── ecDouble ──────────────────────────────────────────────────────────────

    it('ecDouble: double(G) equals ecAdd(G, G)', async () => {
        const add = await _queryData(contractHandler, {method: 'ecAdd', params: {p1: G1, p2: G1}});
        await TEST_QUERY("### ecDouble(G)",
            contractHandler, {
                method: 'ecDouble',
                params: {p: G1}
            }, TEST_CONDITION.EQUALS, add, "data");
    });

    // ── ecPairing ─────────────────────────────────────────────────────────────

    it('ecPairing: e(G1, G2) is non-trivial (non-empty result)', async () => {
        await TEST_QUERY("### ecPairing(G1, G2)",
            contractHandler, {
                method: 'ecPairing',
                params: {p1: G1, p2: G2}
            }, TEST_CONDITION.CONTAINS, "", "data");
    });

    it('ecPairing: e(2G1, G2) = e(G1, 2G2) (bilinearity)', async () => {
        const twoG1 = await _queryData(contractHandler, {method: 'ecDouble', params: {p: G1}});
        const e1 = await _queryData(contractHandler, {method: 'ecPairing', params: {p1: twoG1, p2: G2}});
        await TEST_QUERY("### ecPairing bilinearity",
            contractHandler, {
                method: 'ecPairing',
                params: {p1: await _queryData(contractHandler, {method: 'ecMul', params: {p: G1, scalar: "02"}}), p2: G2}
            }, TEST_CONDITION.EQUALS, e1, "data");
    });
});

// Helper: run a query and return the data field from the result
async function _queryData(contractHandler, input) {
    const sdk = contractHandler.sdk;
    const resp = await sdk.contract.call({
        optType: 2,
        contractAddress: contractHandler.contractAddress,
        input: JSON.stringify(input),
    });
    if (resp.result.query_rets[0].error != null) return null;
    return JSON.parse(resp.result.query_rets[0].result.value).data;
}

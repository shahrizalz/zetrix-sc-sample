'use strict';

import 'library/safe-math'

const SafeMathLib = new SafeMath();

function init() {
    return true;
}

function main(input_str) {
    let input = JSON.parse(input_str);
    let params = input.params;

    throw 'Unknown operating: ' + input.method + '.';
}

function query(input_str) {
    let input = JSON.parse(input_str);
    let params = input.params;

    let result = {};

    // ── uint64 ────────────────────────────────────────────────────────────────
    if (input.method === 'uint64Add') {
        result.data = SafeMathLib.uint64Add(params.x, params.y);
    } else if (input.method === 'uint64Sub') {
        result.data = SafeMathLib.uint64Sub(params.x, params.y);
    } else if (input.method === 'uint64Mul') {
        result.data = SafeMathLib.uint64Mul(params.x, params.y);
    } else if (input.method === 'uint64Div') {
        result.data = SafeMathLib.uint64Div(params.x, params.y);
    } else if (input.method === 'uint64Mod') {
        result.data = SafeMathLib.uint64Mod(params.x, params.y);
    } else if (input.method === 'uint64Compare') {
        result.data = SafeMathLib.uint64Compare(params.x, params.y);
    } else if (input.method === 'stoui64Check') {
        result.data = SafeMathLib.stoui64Check(params.s);

    // ── uint256 ───────────────────────────────────────────────────────────────
    } else if (input.method === 'uint256Add') {
        result.data = SafeMathLib.uint256Add(params.x, params.y);
    } else if (input.method === 'uint256Sub') {
        result.data = SafeMathLib.uint256Sub(params.x, params.y);
    } else if (input.method === 'uint256Mul') {
        result.data = SafeMathLib.uint256Mul(params.x, params.y);
    } else if (input.method === 'uint256Div') {
        result.data = SafeMathLib.uint256Div(params.x, params.y);
    } else if (input.method === 'uint256Mod') {
        result.data = SafeMathLib.uint256Mod(params.x, params.y);
    } else if (input.method === 'uint256Compare') {
        result.data = SafeMathLib.uint256Compare(params.x, params.y);
    } else if (input.method === 'stoui256Check') {
        result.data = SafeMathLib.stoui256Check(params.s);
    } else {
        throw 'Unknown operating: ' + input.method + '.';
    }

    return JSON.stringify(result);
}

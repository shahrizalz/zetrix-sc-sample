'use strict';

import 'library/bitwise-op'

const BitwiseOpLib = new BitwiseOp();

function init() {
    return true;
}

function main(input_str) {
    let input = JSON.parse(input_str);
    throw 'Unknown operating: ' + input.method + '.';
}

function query(input_str) {
    let input = JSON.parse(input_str);
    let params = input.params;

    let result = {};

    if (input.method === 'int64And') {
        result.data = BitwiseOpLib.int64And(params.a, params.b);
    } else if (input.method === 'int64Or') {
        result.data = BitwiseOpLib.int64Or(params.a, params.b);
    } else if (input.method === 'int64Xor') {
        result.data = BitwiseOpLib.int64Xor(params.a, params.b);
    } else if (input.method === 'int64Not') {
        result.data = BitwiseOpLib.int64Not(params.a);
    } else if (input.method === 'int64LShift') {
        result.data = BitwiseOpLib.int64LShift(params.a, params.b);
    } else if (input.method === 'int64RShift') {
        result.data = BitwiseOpLib.int64RShift(params.a, params.b);
    } else if (input.method === 'uint64RShift') {
        result.data = BitwiseOpLib.uint64RShift(params.a, params.b);
    } else if (input.method === 'int256And') {
        result.data = BitwiseOpLib.int256And(params.a, params.b);
    } else if (input.method === 'int256Or') {
        result.data = BitwiseOpLib.int256Or(params.a, params.b);
    } else if (input.method === 'int256Xor') {
        result.data = BitwiseOpLib.int256Xor(params.a, params.b);
    } else if (input.method === 'int256Not') {
        result.data = BitwiseOpLib.int256Not(params.a);
    } else if (input.method === 'int256LShift') {
        result.data = BitwiseOpLib.int256LShift(params.a, params.b);
    } else if (input.method === 'int256RShift') {
        result.data = BitwiseOpLib.int256RShift(params.a, params.b);
    } else if (input.method === 'uint256RShift') {
        result.data = BitwiseOpLib.uint256RShift(params.a, params.b);
    } else {
        throw 'Unknown operating: ' + input.method + '.';
    }

    return JSON.stringify(result);
}

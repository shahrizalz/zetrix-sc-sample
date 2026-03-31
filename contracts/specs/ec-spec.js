'use strict';

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

    if (input.method === 'ecAdd') {
        result.data = Utils.ecAdd(params.p1, params.p2);
    } else if (input.method === 'ecMul') {
        result.data = Utils.ecMul(params.p, params.scalar);
    } else if (input.method === 'ecInv') {
        result.data = Utils.ecInv(params.p);
    } else if (input.method === 'ecDouble') {
        result.data = Utils.ecDouble(params.p);
    } else if (input.method === 'ecPairing') {
        result.data = Utils.ecPairing(params.p1, params.p2);
    } else {
        throw 'Unknown operating: ' + input.method + '.';
    }

    return JSON.stringify(result);
}

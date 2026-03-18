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

    if (input.method === 'pow') {
        result.data = Utils.int256Pow(params.base, params.exp);
    } else if (input.method === 'sqrt') {
        result.data = Utils.int256Sqrt(params.x);
    } else if (input.method === 'min') {
        result.data = Utils.int256Min(params.x, params.y);
    } else if (input.method === 'max') {
        result.data = Utils.int256Max(params.x, params.y);
    } else {
        throw 'Unknown operating: ' + input.method + '.';
    }

    return JSON.stringify(result);
}

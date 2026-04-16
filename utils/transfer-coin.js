const BigNumber = require('bignumber.js');
const expect = require('chai').expect;
const sleep = require("../utils/delay");
const {TEST_RESULT} = require("./constant");

async function TEST_TRANSFER_COIN(msg, sdk, txInitiator, toAddress, amountMo, expectResult = TEST_RESULT.SUCCESS) {

    console.log('\x1b[36m%s\x1b[0m', msg);

    const sourceAddress = txInitiator.sourceAddress;
    const privateKey = txInitiator.privateKey;

    const nonceResult = await sdk.account.getNonce(sourceAddress);
    if (nonceResult.errorCode !== 0) {
        console.log(nonceResult);
        return nonceResult.errorCode;
    }

    const nonce = new BigNumber(nonceResult.result.nonce).plus(1).toString(10);

    const operationResult = sdk.operation.gasSendOperation({
        sourceAddress,
        destAddress: toAddress,
        gasAmount: amountMo,
    });

    if (operationResult.errorCode !== 0) {
        if (expectResult === TEST_RESULT.FAILED) {
            console.log("Pre-submission failure (expected): errorCode " + operationResult.errorCode);
            return;
        }
        console.log(operationResult);
        return operationResult.errorCode;
    }

    const operationItem = operationResult.result.operation;

    const feeData = await sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations: [operationItem],
        signtureNumber: '100',
    });

    if (feeData.errorCode !== 0) {
        if (expectResult === TEST_RESULT.FAILED) {
            console.log("Fee evaluation failure (expected): errorCode " + feeData.errorCode);
            return;
        }
        console.log(feeData);
        return feeData.errorCode;
    }

    const feeLimit = feeData.result.feeLimit;
    const gasPrice = feeData.result.gasPrice;

    const blobInfo = sdk.transaction.buildBlob({
        sourceAddress,
        gasPrice,
        feeLimit,
        nonce,
        operations: [operationItem],
    });

    if (blobInfo.errorCode !== 0) {
        console.log(blobInfo);
        return blobInfo.errorCode;
    }

    const signed = sdk.transaction.sign({
        privateKeys: [privateKey],
        blob: blobInfo.result.transactionBlob,
    });

    if (signed.errorCode !== 0) {
        console.log(signed);
        return signed.errorCode;
    }

    const submitted = await sdk.transaction.submit({
        signature: signed.result.signatures,
        blob: blobInfo.result.transactionBlob,
    });

    if (submitted.errorCode !== 0) {
        console.log(submitted);
        return submitted.errorCode;
    }

    let info = null;
    for (let i = 0; i < 10; i++) {
        console.log("Getting the transaction history (attempt " + (i + 1).toString() + ")...")
        info = await sdk.transaction.getInfo(submitted.result.hash);
        if (info.errorCode === 0) {
            console.log("Transaction confirmed: " + submitted.result.hash);
            break;
        }
        sleep(2000);
    }

    if (expectResult === TEST_RESULT.FAILED) {
        expect(info.errorCode).to.equal(151);
    } else {
        expect(info.errorCode).to.equal(0);
    }
}

module.exports = TEST_TRANSFER_COIN;

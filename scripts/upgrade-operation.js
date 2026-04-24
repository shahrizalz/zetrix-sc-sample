const ZtxChainSDK = require('zetrix-sdk-nodejs');
const fs = require("fs");
const BigNumber = require('bignumber.js');
const sleep = require("../utils/delay");
const merge = require("../utils/merge");
const beautifyData = require("../utils/beautify");

async function upgradeOperation(nodeUrl, sourceAddress, privateKey, contractName, contractAddress) {

    const sdk = new ZtxChainSDK({
        host: nodeUrl,
        secure: true
    });

    let baseDir = './contracts/';

    let contractData = beautifyData(merge(baseDir, fs.readFileSync(baseDir + contractName, 'utf8')));

    fs.writeFile('merged-contract.js', contractData, (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;
    });

    console.log("#####################################")
    console.log("###  Start Deployment...")
    console.log("#####################################")
    console.log("");

    const nonceResult = await sdk.account.getNonce(sourceAddress);

    if (nonceResult.errorCode !== 0) {
        console.log("nonceResult", nonceResult);
        console.log("### ERROR while getting nonce...")
        return;
    }

    let nonce = nonceResult.result.nonce;
    nonce = new BigNumber(nonce).plus(1).toString(10);

    console.log("Your current nonce is", nonce);

    let operation = sdk.operation.contractUpgradeOperation({
        contractAddress: contractAddress,
        sourceAddress: sourceAddress,
        sPayload: true,
        sOwner: false,
        payload: contractData
    });

    if (operation.errorCode !== 0) {
        console.log(operation)
        console.log("### ERROR while upgrade contract operation...")
        return;
    }

    const operationItem = operation.result.operation;

    let feeData = await sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations: [operationItem],
        privateKeys: [privateKey],
    });

    if (feeData.errorCode !== 0) {
        console.log(feeData)
        console.log("### ERROR while evaluating fee...")
        return;
    }

    console.log("Fee limit for this contract is", feeData.result.feeLimit);
    console.log("Estimated gas price is", feeData.result.gasPrice);

    let submitted = await sdk.transaction.submit({
        signature: feeData.result.signatures,
        blob: feeData.result.transactionBlob
    })

    if (submitted.errorCode !== 0) {
        console.log(submitted)
        console.log("### ERROR while submitting contract...")
        return;
    }

    console.log("");
    let info = null;
    for (let i = 0; i < 10; i++) {
        console.log("Getting the transaction history (attempt " + (i + 1).toString() + ")...")
        info = await sdk.transaction.getInfo(submitted.result.hash)
        if (info.errorCode === 0) {
            break;
        }
        sleep(2000);
    }

    console.log("");
    if (info != null && info.errorCode === 0) {
        console.log("Your contract has been successfully deployed.")
        console.log("Hash value", submitted.result.hash);
    } else {
        console.log("Your contract deployment has failed.")
        console.log("Hash value", submitted.result.hash);
    }

    console.log("");
    console.log("#####################################")
    console.log("### Finish Deployment...")
    console.log("#####################################")
}

module.exports = upgradeOperation;

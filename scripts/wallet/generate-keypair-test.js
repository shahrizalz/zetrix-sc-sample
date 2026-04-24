const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
const KeyPair = require('zetrix-encryption-nodejs/lib/keypair');
require('dotenv').config({ path: '.env' });


const sdk = new ZtxChainSDK({
    host: process.env.NODE_URL,
    secure: false
});

async function main() {


    const keyPair = KeyPair.getKeyPair("hybrid");

    console.log(keyPair);
}

main().catch(err => {
    console.error('Unexpected error:', err.message);
    process.exit(1);
});

const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
require('dotenv').config({ path: '.env' });

const address = process.argv[2] || process.env.ZTX_ADDRESS;

if (!address) {
    console.error('Usage: node scripts/wallet/balance.js <address>');
    process.exit(1);
}

const sdk = new ZtxChainSDK({
    host: process.env.NODE_URL,
    secure: false
});

async function main() {
    console.log('');
    console.log('Address :', address);
    console.log('Node    :', process.env.NODE_URL);
    console.log('');

    const result = await sdk.account.getInfo(address);

    if (result.errorCode !== 0) {
        console.error('Error:', result.errorDesc);
        process.exit(1);
    }

    const info = result.result;
    const balance = new BigNumber(info.balance).dividedBy(1e6).toFixed(6);

    console.log('Balance    :', balance, 'ZTX');
    console.log('Balance raw:', info.balance, 'MO');
    console.log('Nonce      :', info.nonce);
    console.log('');
}

main().catch(err => {
    console.error('Unexpected error:', err.message);
    process.exit(1);
});

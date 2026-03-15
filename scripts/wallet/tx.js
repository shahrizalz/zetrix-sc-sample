const ZtxChainSDK = require('zetrix-sdk-nodejs');
const BigNumber = require('bignumber.js');
require('dotenv').config({ path: '.env' });

const hash = process.argv[2];

if (!hash) {
    console.error('Usage: node scripts/wallet/tx.js <transactionHash>');
    process.exit(1);
}

const sdk = new ZtxChainSDK({
    host: process.env.NODE_URL,
    secure: false
});

async function main() {
    console.log('');
    console.log('Hash :', hash);
    console.log('Node :', process.env.NODE_URL);
    console.log('');

    const result = await sdk.transaction.getInfo(hash);

    if (result.errorCode !== 0) {
        console.error('Error:', result.errorDesc);
        console.log('Transaction not found or still pending.');
        process.exit(1);
    }

    const tx = result.result.transactions[0];
    const status = tx.error_code === 0 ? 'SUCCESS' : 'FAILED';

    console.log('Status      :', status);
    console.log('Ledger seq  :', tx.ledger_seq);
    console.log('Source      :', tx.transaction.source_address);
    console.log('Fee paid    :', tx.actual_fee, 'MO');
    console.log('Gas price   :', tx.transaction.gas_price, 'MO');
    console.log('');

    const ops = tx.transaction.operations;
    ops.forEach((op, i) => {
        console.log(`Operation [${i + 1}]:`);

        if (op.type === 1) {
            // GAS send
            const amount = new BigNumber(op.pay_coin.amount).dividedBy(1e6).toFixed(6);
            console.log('  Type   : Transfer');
            console.log('  To     :', op.pay_coin.dest_address);
            console.log('  Amount :', amount, 'ZTX (', op.pay_coin.amount, 'MO )');
        } else if (op.type === 6) {
            // Contract create
            console.log('  Type   : Contract Create');
            if (tx.error_desc) {
                try {
                    const desc = JSON.parse(tx.error_desc);
                    if (desc[0] && desc[0].contract_address) {
                        console.log('  Contract address:', desc[0].contract_address);
                    }
                } catch (_) {}
            }
        } else if (op.type === 7) {
            // Contract invoke
            console.log('  Type   : Contract Invoke');
            console.log('  Contract:', op.invoke_contract && op.invoke_contract.contract_address);
        } else {
            console.log('  Type code:', op.type);
        }

        console.log('');
    });

    if (tx.error_code !== 0) {
        console.log('Error code :', tx.error_code);
        console.log('Error desc :', tx.error_desc);
        console.log('');
    }
}

main().catch(err => {
    console.error('Unexpected error:', err.message);
    process.exit(1);
});

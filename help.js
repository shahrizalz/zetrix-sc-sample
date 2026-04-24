console.log(`
Available npm scripts:

Deployment Scripts:
  - npm run deploy:math              Deploys math library
  - npm run deploy:bytes             Deploys byte library
  - npm run deploy:logic-op          Deploys logic op library
  - npm run deploy:ztp20 <arg>       Deploys ZTP20 (arg: core, permit, pausable, burnable, capped)
  - npm run deploy:ztp721 <arg>      Deploys ZTP721 (arg: core, pausable, burnable, enumerable)
  - npm run deploy:ztp1155 <arg>     Deploys ZTP1155 (arg: core, pausable, burnable, supply, uri)

Upgrade Scripts:
  - npm run upgrade:ztp20 <arg>      Upgrades ZTP20 (arg: core, permit, pausable, burnable, capped)
  - npm run upgrade:ztp721 <arg>     Upgrades ZTP721 (arg: core, pausable, burnable, enumerable)
  - npm run upgrade:ztp1155 <arg>    Upgrades ZTP1155 (arg: core, pausable, burnable, supply, uri)

Wallet Scripts:
  - npm run wallet:balance <address>  Check account balance
  - npm run wallet:transfer           Transfer ZTX interactively
  - npm run wallet:fund               Fund multiple accounts interactively
  - npm run wallet:keygen             Generate a new keypair (interactive)
  - npm run wallet:sign-transfer <toAddress> <amount>  Build+sign transfer, output blob & signatures (no submit)
  - npm run wallet:evaluate-fee-s1 <toAddress> <amount>  evaluateFee S1: privateKeys+JSON → exact fee, blob & sigs (submit-ready)
  - npm run wallet:evaluate-fee-s2 <toAddress> <amount>  evaluateFee S2: blob+signatures → exact fee only (external signer)
  - npm run wallet:evaluate-fee-s3 <toAddress> <amount>  evaluateFee S3: JSON only → fee estimate (Ed25519 fallback, no key needed)
  - npm run wallet:evaluate-fee-s4 <toAddress> <amount>  evaluateFee S4: blob only → fee estimate (Ed25519 fallback, no key needed)
  - npm run wallet:tx <hash>          Lookup transaction by hash

Test Scripts:
  - npm test <arg>                   Run on-chain integration tests (arg: tests/integration/TEST_FILE.js)
  - npm run test-coverage <arg>      Run off-chain unit testing with coverage (arg: tests/unit/TEST_FILE.js)
    
Run 'npm run <script>' to execute a command.
`);
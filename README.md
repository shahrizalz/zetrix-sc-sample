# Zetrix Contract Development Toolkit

A comprehensive Node.js-based framework for developing, deploying, and testing smart contracts on the Zetrix blockchain. This toolkit provides ready-to-use implementations of Zetrix token standards (ZTP20, ZTP721, ZTP1155) with multiple variants, complete test infrastructure, and deployment management tools.

## Features

- **Token Standard Implementations**
  - **ZTP20** (Fungible Tokens): Core, Burnable, Permit, Pausable, Capped
  - **ZTP721** (NFTs): Core, Burnable, Pausable, Enumerable
  - **ZTP1155** (Multi-Token): Core, Burnable, Pausable, Supply, URI Storage

- **Development Tools**
  - Contract deployment and upgrade scripts
  - On-chain integration testing
  - Unit testing with code coverage
  - Mock implementations for testing
  - Contract merging and beautification utilities

- **Library Utilities**
  - Math library (256-bit arithmetic operations)
  - Bytes manipulation utilities
  - Logic operations
  - Pausable functionality
  - Nonce management

## Project Structure

```
template/
├── contracts/              # Smart contract code
│   ├── interface/         # Contract interfaces (ZTP20, ZTP721, ZTP1155)
│   ├── library/           # Reusable contract implementations
│   │   ├── ztp20/        # Token standard implementations
│   │   ├── ztp721/       # NFT standard implementations
│   │   ├── ztp1155/      # Multi-token implementations
│   │   └── [utilities]   # math.js, bytes.js, logic-op.js, etc.
│   ├── specs/            # Deployable contract specifications
│   ├── utils/            # Contract utilities (basic operations, struct, interface)
│   └── internal/         # Built-in function references
│
├── scripts/              # Deployment and upgrade scripts
├── tests/                # Test suites
│   ├── integration/      # On-chain integration tests
│   └── unit/             # Unit tests with coverage
│
├── utils/                # Node.js utility modules
└── generated/            # Generated/compiled contracts
```

## Getting Started

### Prerequisites

- Node.js
- Zetrix address and private key
- Access to Zetrix network

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your credentials:
```bash
PRIVATE_KEY=<PRIVATE_KEY>
ZTX_ADDRESS=<ZETRIX_ADDRESS>
NODE_URL=test-node.zetrix.com
```

## Usage

### View Available Commands
```bash
npm run help
```

### Contract Deployment

Deploy token contracts with specific variants:

**ZTP20 (Fungible Tokens)**
```bash
npm run deploy:ztp20 core        # Basic fungible token
npm run deploy:ztp20 burnable    # Token with burn functionality
npm run deploy:ztp20 permit      # Token with permit-based approval
npm run deploy:ztp20 pausable    # Token with pause/unpause
npm run deploy:ztp20 capped      # Token with maximum supply cap
```

**ZTP721 (NFTs)**
```bash
npm run deploy:ztp721 core       # Basic NFT
npm run deploy:ztp721 burnable   # NFT with burn functionality
npm run deploy:ztp721 pausable   # NFT with pause/unpause
npm run deploy:ztp721 enumerable # NFT with enumerable support
```

**ZTP1155 (Multi-Token)**
```bash
npm run deploy:ztp1155 core      # Basic multi-token
npm run deploy:ztp1155 burnable  # Multi-token with burn
npm run deploy:ztp1155 pausable  # Multi-token with pause/unpause
npm run deploy:ztp1155 supply    # Multi-token with supply tracking
npm run deploy:ztp1155 uri       # Multi-token with URI storage
```

**Library Utilities**
```bash
npm run deploy:math              # Deploy math library
npm run deploy:bytes             # Deploy bytes library
npm run deploy:logic-op          # Deploy logic operations
```

### Contract Upgrade

Upgrade existing contracts:
```bash
npm run upgrade:ztp20 <variant>
npm run upgrade:ztp721 <variant>
npm run upgrade:ztp1155 <variant>
```

### Testing

**Integration Tests** (on-chain)
```bash
npm test tests/integration/<TEST_CASE>.js
```

Example:
```bash
npm test tests/integration/ztp20/test-ztp20Permit.js
```

**Unit Tests** (with coverage)
```bash
npm run test-coverage tests/unit/<TEST_CASE>.js
```

Example:
```bash
npm run test-coverage tests/unit/ztp20/test-ztp20.js
```

### Contract Development

Contract scripts are located in the `contracts/` directory. To create or modify contracts:

1. Add/modify contract files in appropriate subdirectories:
   - `contracts/library/` for reusable implementations
   - `contracts/specs/` for deployable specifications
   - `contracts/utils/` for utility functions

2. If creating new deployable contracts, add corresponding deployment scripts in `scripts/` directory

3. Update `package.json` scripts section if adding new deployment/upgrade commands

## Token Standards

### ZTP20 - Fungible Token Standard

The ZTP20 standard provides a fungible token implementation similar to ERC20. Available variants:

- **Core**: Basic transfer, approve, and transferFrom functionality
- **Burnable**: Adds token burning capability
- **Permit**: Enables gasless approvals using off-chain signatures
- **Pausable**: Allows pausing/unpausing token transfers
- **Capped**: Enforces maximum token supply

### ZTP721 - Non-Fungible Token (NFT) Standard

The ZTP721 standard provides NFT functionality similar to ERC721. Available variants:

- **Core**: Basic NFT minting, burning, and transfer
- **Burnable**: Adds NFT burning capability
- **Pausable**: Allows pausing/unpausing NFT transfers
- **Enumerable**: Adds enumeration support for tracking all tokens

### ZTP1155 - Multi-Token Standard

The ZTP1155 standard supports multiple token types (fungible and non-fungible) in a single contract. Available variants:

- **Core**: Basic multi-token functionality with batch operations
- **Burnable**: Adds token burning capability
- **Pausable**: Allows pausing/unpausing transfers
- **Supply**: Adds supply tracking for each token type
- **URI Storage**: Enables custom URI metadata for each token

## Test Utilities

The toolkit provides test helper functions for contract testing:

### TEST_INVOKE

Executes a contract transaction and validates the result:

```javascript
TEST_INVOKE(
  "Test description",
  contractAddress,
  txInitiator,
  { method: "methodName", params: {...} },
  expectedResult  // TEST_RESULT.SUCCESS or TEST_RESULT.FAILED
)
```

### TEST_QUERY

Queries contract state and validates the response:

```javascript
TEST_QUERY(
  "Test description",
  contractAddress,
  { method: "methodName", params: {...} },
  TEST_CONDITION.EQUALS,  // Comparison operator
  expectedValue,
  ["result", "fieldPath"]  // JSON path to result field
)
```

Available test conditions:
- `TEST_CONDITION.EQUALS`
- `TEST_CONDITION.GREATER_THAN`
- `TEST_CONDITION.LESSER_THAN`
- `TEST_CONDITION.CONTAINS`
- And more (see `utils/constant.js`)

## Development Guides

The development of Zetrix smart contract is using Javascript ES5 which has less support on the OOP such as `class`. Hence, we are imitating the OOP implementation by using functionalities available in the ES5.

### Class

OOP implementation
```java
class Example {
    
    Example(String param) {
        // constructor
    }
}

Example exampleInst = new Example(param);
```

ES5 Javascript implementation
```javascript
const Example = function () {
    
    const self = this; // keep the context
    
    self.init = function (param) {
        // constructor
    };
};

const exampleInst = new Example();
exampleInst.init(param);
```

#### Managing private, protected and public method

OOP implementation
```java
class Example {
    
    private void privateMethod() {
        // private method
    }
    
    public void publicMethod() {
        // public method
    }

    protected void protectedMethod() {
        // protected method
    }
}
```

ES5 Javascript implementation
```javascript
const Example = function () {
    
    const self = this; // keep the context

    self.p = {/*protected function*/};
    
    const _privateMethod = function () {
        // private method
    };
    
    self.publicMethod = function () {
        // public method
    };
    
    self.p.protectedMethod = function () {
        // protected method : this method is similar to the public method, but we just defined in `p` nameclass to differentiate  
    };
};
```

#### Inheritance and override

OOP implementation
```java
class ExampleParent {
    
    public void parentMethod1() {
        
    }

    public void parentMethod2() {

    }
    
    public void parentMethod3(int a, int b) {
        
    }
}

class ExampleChild extends ExampleParent {
    
    @Override
    public void parentMethod1() {
        // Override parent method
        // Do something else and continue with original parentMethod
        super.parentMethod1();
    }

    @Override
    public void parentMethod2() {
        // Override parent method
    }
    
    private void childMethod(int a, int b) {
        // Use parent function in child wrapper
        return super.parentMethod3(a, b);
    } 
}
```

ES5 Javascript implementation
```javascript
const ExampleParent = function () {

    const self = this; // keep the context

    self.p = {/*protected function*/};
    
    self.p.parentMethod1 = function () {

    };
    
    self.p.parentMethod2 = function() {
        
    };
    
    self.parentMethod3 = function(a, b) {
        
    };
};

const ExampleChild = function () {

    const self = this;

    ExampleParent.call(self); // Inherit
    
    const _parentMethod1 = self.p.parentMethod1
    self.p.parentMethod1 = function(){
        // Override parent method
        // Do something else and continue with original parentMethod
        _parentMethod1.call(self);
    };
    
    self.p.parentMethod2 = function() {
        // Override parent method
    };

    const _childMethod = function() {
        // Use parent function in child wrapper
        return self.parentMethod3(a, b);
    };

};
```

## Built-in Functions

Zetrix smart contracts have access to built-in functions for blockchain operations and utilities. These are documented in:

- `contracts/internal/chain.js` - Chain-level operations (load/store metadata, transactions, etc.)
- `contracts/internal/utils.js` - Utility functions (256-bit math, hashing, encoding, etc.)

### Common Chain Functions

```javascript
Chain.load(key)              // Load metadata from blockchain
Chain.store(key, value)      // Store metadata to blockchain
Chain.del(key)               // Delete metadata
Chain.getBalance(address)    // Get account balance
Chain.payCoin(address, amount) // Transfer coins
```

### Common Utils Functions

```javascript
Utils.int256Add(x, y)        // 256-bit addition
Utils.int256Sub(x, y)        // 256-bit subtraction
Utils.int256Mul(x, y)        // 256-bit multiplication
Utils.int256Div(x, y)        // 256-bit division
Utils.int256Compare(x, y)    // 256-bit comparison
Utils.sha256(data)           // SHA-256 hashing
Utils.toBaseUnit(value)      // Convert to base unit
Utils.addressCheck(address)  // Validate address
```

For complete documentation, refer to the files in `contracts/internal/`.

## Dependencies

### Production Dependencies

- **dotenv** (^16.0.1) - Environment variable management
- **js-beautify** (^1.15.1) - Code formatting
- **ssl-root-cas** (^1.3.1) - SSL certificate handling
- **zetrix-sdk-nodejs** (^1.0.1) - Zetrix blockchain SDK

### Development Dependencies

- **chai** (^4.5.0) - Assertion library for testing
- **mocha** (^10.8.2) - Test framework
- **mocha-generators** (^2.0.0) - Generator support for async tests
- **nyc** (^17.1.0) - Code coverage reporting
- **sinon** (^19.0.2) - Mocking and stubbing library
- **istanbul-lib-instrument** (^6.0.3) - Code coverage instrumentation

## Code Coverage

Code coverage is configured to track generated contract files. Coverage reports are generated in both text and HTML formats:

```bash
# Run tests with coverage
npm run test-coverage tests/unit/<TEST_CASE>.js

# View HTML report
open coverage/index.html
```

## Repository

- **GitHub**: https://github.com/armmarov/zetrix-contract-development-tool
- **Version**: 1.1.0
- **Release Notes**: See `RELEASE-NOTES.md` for version history and changes

## License

MIT License - Copyright 2022 Genesis

See `LICENSE` file for full license text.

## Additional Resources

- Run `npm run help` to see all available commands
- Check `RELEASE-NOTES.md` for version history and updates
- Refer to `contracts/internal/` for built-in function documentation
- See `tests/` directory for comprehensive examples of contract usage
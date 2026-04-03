# HyperEVM Oracle Price Reader

Demonstrates how to read oracle prices from HyperEVM precompile using **RPC calls** or **smart contract calls**.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/) installed
- Node.js and npm/yarn (for TypeScript RPC method)
- Environment variables configured (copy `.env.example` to `.env`)

## Setup

```bash
# Install dependencies
npm install

# Build contracts
forge build
```

## Methods

### Method 1: Direct RPC Call (No Contract Deployment)

Read oracle prices directly via RPC calls to the precompile address `0x0000000000000000000000000000000000000807`. No contract deployment required.

**TypeScript Example:**

```bash
# Query ETH price on testnet
ts-node test/readPrice.ts ETH testnet

# Query BTC price
ts-node test/readPrice.ts BTC testnet
```

**Direct RPC Call:**

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(RPC_URL);
const oraclePrecompile = '0x0000000000000000000000000000000000000807';
const tokenIndex = 0; // ETH

// Encode token index as 32-byte hex
const data = ethers.zeroPadValue(ethers.toBeHex(tokenIndex), 32);

// Call precompile directly
const result = await provider.call({ to: oraclePrecompile, data });
const rawPrice = ethers.getBigInt(result);
```

### Method 2: Smart Contract Call

Deploy `PriceOracleReader` contract and call it to read and store oracle prices.

**Deploy Contract:**

```bash
forge script script/DeployPriceOracleReader.s.sol:PriceOracleReaderScript \
  --rpc-url $TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**Call Contract (via cast):**

```bash
# Get stored price for token index 0 (ETH)
cast call <CONTRACT_ADDRESS> "getLatestPrice(uint32)" 0 --rpc-url $TESTNET_RPC_URL

# Update and store new price for token index 0
cast send <CONTRACT_ADDRESS> "updatePrice(uint32)" 0 --rpc-url $TESTNET_RPC_URL --private-key $PRIVATE_KEY
```

**Call Contract (Solidity):**

```solidity
PriceOracleReader reader = PriceOracleReader(CONTRACT_ADDRESS);

// Update price (requires transaction)
uint256 price = reader.updatePrice(0); // ETH index

// Read stored price (view call)
uint256 storedPrice = reader.getLatestPrice(0);
```

## Precompile Addresses

| Precompile | Address | Description |
|------------|---------|-------------|
| Oracle Px | `0x...0807` | Oracle price |
| Mark Px | `0x...0806` | Mark price |
| Spot Px | `0x...0808` | Spot price |
| Perp Asset Info | `0x...080a` | Perp asset metadata |

See `src/L1Read.sol` for all available precompiles.

## Price Conversion

Raw prices from precompile use specific decimals:

```
formattedPrice = rawPrice / 10^(6 - szDecimals)
```

Example: ETH has `szDecimals = 5`, so:
- Raw price: `350000` (6 decimals)
- Formatted: `$35000.0`

## Project Structure

```
src/
├── L1Read.sol           # Base contract with all precompile calls
├── PriceOracleReader.sol # Example contract using oraclePx()
test/
├── readPrice.ts         # TypeScript RPC reader
script/
├── DeployPriceOracleReader.s.sol  # Deployment script
```

## Environment Variables

Create `.env` file:

```bash
TESTNET_RPC_URL=https://testnet-rpc-url
MAINNET_RPC_URL=https://mainnet-rpc-url
TESTNET_API_URL=https://testnet-api-url
MAINNET_API_URL=https://mainnet-api-url
PRIVATE_KEY=your-private-key
```

## License

MIT
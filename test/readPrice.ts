import { ethers } from 'ethers';
import 'dotenv/config';

const PRECOMPILE_ADDRESS_TESTNET = '0x0000000000000000000000000000000000000807';
const PRECOMPILE_ADDRESS_MAINNET = '0x0000000000000000000000000000000000000807';

interface TokenMeta {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  marginTableId: number;
}

interface MetaResponse {
  universe: Array<{
    name: string;
    szDecimals: number;
    maxLeverage: number;
    marginTableId: number;
  }>;
}

async function fetchTokenMeta(network: 'testnet' | 'mainnet'): Promise<Array<TokenMeta & { index: number }>> {
  const apiUrl = network === 'testnet'
    ? process.env.TESTNET_API_URL
    : process.env.MAINNET_API_URL;
  
  if (!apiUrl) {
    throw new Error(`API URL not found for ${network}`);
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'meta' })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }

  const data = await response.json() as MetaResponse;
  
  const tokens = data.universe || Object.values(data) as any[];
  
  return tokens.map((token: any, index: number) => ({
    index,
    name: token.name,
    szDecimals: token.szDecimals,
    maxLeverage: token.maxLeverage,
    marginTableId: token.marginTableId
  }));
}

async function getTokenInfo(tokenIndex: number, network: 'testnet' | 'mainnet'): Promise<TokenMeta & { index: number }> {
  const tokens = await fetchTokenMeta(network);
  const token = tokens.find(t => t.index === tokenIndex);
  
  if (!token) {
    throw new Error(`Token index ${tokenIndex} not found`);
  }
  
  return token;
}

export async function readTokenPrice(tokenIndex: number, network: 'testnet' | 'mainnet' = 'testnet'): Promise<bigint> {
  const rpcUrl = network === 'testnet' 
    ? process.env.TESTNET_RPC_URL 
    : process.env.MAINNET_RPC_URL;
  
  if (!rpcUrl) {
    throw new Error(`RPC URL not found for ${network}`);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const precompileAddress = network === 'testnet' 
    ? PRECOMPILE_ADDRESS_TESTNET 
    : PRECOMPILE_ADDRESS_MAINNET;

  const inputParam = ethers.zeroPadValue(ethers.toBeHex(tokenIndex), 32);
  
  try {
    const result = await provider.call({
      to: precompileAddress,
      data: inputParam
    });

    const price = ethers.getBigInt(result);
    return price;
  } catch (error) {
    throw new Error(`Failed to read price for token index ${tokenIndex}: ${error}`);
  }
}

export function formatPrice(rawPrice: bigint, szDecimals: number): string {
  const adjustedValue = Number(rawPrice) / Math.pow(10, 6 - szDecimals);
  
  return adjustedValue.toPrecision(6);
}

export async function getTokenPriceAndFormat(tokenIndex: number, network: 'testnet' | 'mainnet' = 'testnet'): Promise<{ raw: bigint; formatted: string; tokenInfo: TokenMeta & { index: number } }> {
  const tokenInfo = await getTokenInfo(tokenIndex, network);
  const rawPrice = await readTokenPrice(tokenIndex, network);
  const formatted = formatPrice(rawPrice, tokenInfo.szDecimals);
  
  return {
    raw: rawPrice,
    formatted,
    tokenInfo
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: ts-node test/readPrice.ts <tokenSymbol> [network]');
    console.log('Example: ts-node test/readPrice.ts ETH testnet');
    console.log('         ts-node test/readPrice.ts BTC testnet');
    console.log('   This queries token price by symbol on testnet/mainnet');
    process.exit(1);
  }

  const tokenSymbol = args[0].toUpperCase();
  const network = (args[1] as 'testnet' | 'mainnet') || 'testnet';

  console.log(`Querying price for ${tokenSymbol} on ${network}...`);
  
  try {
    const tokens = await fetchTokenMeta(network);
    const token = tokens.find(t => t.name === tokenSymbol || t.name.toUpperCase() === tokenSymbol);
    
    if (!token) {
      console.error(`Token ${tokenSymbol} not found. Available tokens:`);
      tokens.slice(0, 10).forEach(t => console.log(`  - ${t.name} (index: ${t.index})`));
      if (tokens.length > 10) console.log(`  ... and ${tokens.length - 10} more`);
      process.exit(1);
    }

    console.log(`Found ${token.name} at index ${token.index} (szDecimals: ${token.szDecimals})`);
    
    const priceData = await getTokenPriceAndFormat(token.index, network);
    
    console.log(`\n${token.name} Price:`);
    console.log(`  Raw (hex): 0x${priceData.raw.toString(16)}`);
    console.log(`  Raw (dec): ${priceData.raw.toString()}`);
    console.log(`  USD: $${priceData.formatted}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
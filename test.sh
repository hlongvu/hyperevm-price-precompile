curl --location 'https://api.hyperliquid-testnet.xyz/info' \
--header 'Content-Type: application/json' \
--data '{"type": "meta"}'

# result
{"szDecimals":4,"name":"ETH","maxLeverage":25,"marginTableId":53}
Index: 4

0x0000000000000000000000000000000000000000000000000000000000000004


precompile testnet: 0x0000000000000000000000000000000000000800

cast call 0x0000000000000000000000000000000000000807 0x0000000000000000000000000000000000000000000000000000000000000004 --rpc-url $TESTNET_RPC_URL

# toggle big block at https://hyperevm-block-toggle.vercel.app/

forge build
forge script script/DeployPriceOracleReader.s.sol:PriceOracleReaderScript --rpc-url $TESTNET_RPC_URL --account fcb8 --broadcast --gas-limit 25000000
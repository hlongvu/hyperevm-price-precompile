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


##### 998
✅  [Success] Hash: 0xc06fbc3d62396563c67dc4f70c930a2f9ca39800be42206e5b76dd16e143c256
Contract Address: 0x6F3E9A9A86a136bEe32C32F6ac6442cC90a41BAF
Block: 49884492
Paid: 0.000429131504291315 ETH (4291315 gas * 0.100000001 gwei)


### Get price
cast call 0x6F3E9A9A86a136bEe32C32F6ac6442cC90a41BAF "updatePrice(uint32)(uint256)" 4 --rpc-url $TESTNET_RPC_URL

### sign l1 action to use big block
https://github.com/hyperliquid-dex/hyperliquid-python-sdk/blob/master/examples/basic_evm_use_big_blocks.py
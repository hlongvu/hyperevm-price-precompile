// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


// Import the L1Read contract
import "./L1Read.sol";

contract PriceOracleReader is L1Read {
    // Mapping to store the latest price for each perp asset index
    mapping(uint32 => uint256) public latestPrices;
    
    // Mapping to store asset names
    mapping(uint32 => string) public assetNames;
    
    // Event for price updates
    event PriceUpdated(uint32 indexed perpIndex, uint256 price);
    
    /**
     * @dev Update the price for a perp asset
     * @param perpIndex The index of the perp asset
     * @return The converted price with 18 decimals
     */
    function updatePrice(uint32 perpIndex) public returns (uint256) {
        // Get the raw oracle price using the inherited function
        uint64 rawPrice = oraclePx(perpIndex);
        
        // Get the asset info using the inherited function
        PerpAssetInfo memory assetInfo = perpAssetInfo(perpIndex);
        uint8 szDecimals = assetInfo.szDecimals;
        
        // Store the asset name
        assetNames[perpIndex] = assetInfo.coin;
        
        // Convert the price: price / 10^(6 - szDecimals) * 10^18
        // This converts from raw price to human-readable price with 18 decimals
        uint256 divisor = 10 ** (6 - szDecimals);
        uint256 convertedPrice = (uint256(rawPrice) * 1e18) / divisor;
        
        // Store the converted price
        latestPrices[perpIndex] = convertedPrice;
        
        // Emit event
        emit PriceUpdated(perpIndex, convertedPrice);
        
        return convertedPrice;
    }
    
    /**
     * @dev Get the latest price for a perp asset
     * @param perpIndex The index of the perp asset
     * @return The latest converted price with 18 decimals
     */
    function getLatestPrice(uint32 perpIndex) public view returns (uint256) {
        return latestPrices[perpIndex];
    }
}
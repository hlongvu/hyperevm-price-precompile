// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PriceOracleReader} from "../src/PriceOracleReader.sol";

contract PriceOracleReaderScript is Script {
    PriceOracleReader public priceOracleReader;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        priceOracleReader = new PriceOracleReader();
        
        console.log("PriceOracleReader deployed at:", address(priceOracleReader));

        vm.stopBroadcast();
    }
}

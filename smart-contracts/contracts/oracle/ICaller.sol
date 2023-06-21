// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ICaller {
    function fulfillCo2PricePerTonRequest(uint256 co2PricePerTon, uint256 id) external;
    function fulfillGramCo2PerKwhRequest(uint256 gramCo2PerKwh, uint256 id) external;
    function fulfillSpotPriceRequest(uint256 spotPrice, uint256 id) external;
}
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ITradingContextOracle {
    function requestCo2PricePerTon() external returns (uint256);
    function requestGramCo2PerKwh() external returns (uint256);
    function requestSpotPrice() external returns (uint256);
}
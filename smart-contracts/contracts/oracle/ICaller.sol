// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ICaller {
    function fulfillElectricityDataRequest(uint256 carbonIntensity, uint256 priceCarbon, uint256 id) external;
}
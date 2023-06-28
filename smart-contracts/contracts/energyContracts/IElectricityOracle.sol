// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IElectricityOracle {
    function requestElectricityData() external returns (uint256);
}
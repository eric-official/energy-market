// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ICaller {
    function fulfillRandomNumberRequest(uint256 randomNumber, uint256 id) external;
}
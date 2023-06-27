// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IElectricityOracle.sol";

contract Caller is Ownable {
    IElectricityOracle private electricityOracle;

    mapping(uint256=>bool)  requests;
    mapping(uint256=>ElectricityData) results;

    struct ElectricityData {
        uint256 carbonIntensity; // 
        uint256 priceCarbon; // in kWh
    }
    
    modifier onlyElectricityOracle() {
        require(msg.sender == address(electricityOracle), "Unauthorized.");
        _;
    }

    function setElectricityOracleAddress(address newAddress) external onlyOwner {
        electricityOracle = IElectricityOracle(newAddress);

        emit OracleAddressChanged(newAddress);
    }

    function getElectricityData() external {
        require(electricityOracle != IElectricityOracle(address(0)), "Oracle not initialized.");

        uint256 id = electricityOracle.requestElectricityData();
        requests[id] = true;

        emit ElectricityDataRequested(id);
    }

    function fulfillElectricityDataRequest(uint256 carbonIntensity, uint256 priceCarbon, uint256 id) external onlyElectricityOracle {
        require(requests[id], "Request is invalid or already fulfilled.");

        results[id] = ElectricityData(carbonIntensity, priceCarbon);
        delete requests[id];

        emit ElectricityDataReceived(carbonIntensity, priceCarbon, id);
    }

    event OracleAddressChanged(address oracleAddress);
    event ElectricityDataRequested(uint256 id);
    event ElectricityDataReceived(uint256 carbonIntensity, uint256 priceCarbon, uint256 id);
}
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IRandOracle.sol";

contract Caller is Ownable {
    ITradingContextOracle private tradingContextOracle;
    
    mapping(uint256=>bool)  requests;
    mapping(uint256=>uint256) results;
    
    modifier onlyRandOracle() {
        require(msg.sender == address(tradingContextOracle), "Unauthorized.");
        _;
    }

    function setRandOracleAddress(address newAddress) external onlyOwner {
        tradingContextOracle = ITradingContextOracle(newAddress);

        emit OracleAddressChanged(newAddress);
    }

    function getCo2PricePerTon() external {
        require(tradingContextOracle != ITradingContextOracle(address(0)), "Oracle not initialized.");

        uint256 id = tradingContextOracle.requestCo2PricePerTon();
        requests[id] = true;

        emit Co2PricePerTonRequested(id);
    }

    function fulfillCo2PricePerTonRequest(uint256 co2PricePerTon, uint256 id) external onlyRandOracle {
        require(requests[id], "Request is invalid or already fulfilled.");

        results[id] = co2PricePerTon;
        delete requests[id];

        emit Co2PricePerTonReceived(co2PricePerTon, id);
    }


    function getGramCo2PerKwh() external {
        require(tradingContextOracle != IRandOracle(address(0)), "Oracle not initialized.");

        uint256 id = tradingContextOracle.requestGramCo2PerKwh();
        requests[id] = true;

        emit Co2PerKwhRequested(id);
    }

    function fulfillGramCo2PerKwhRequest(uint256 gramCo2PerKwh, uint256 id) external onlyRandOracle {
        require(requests[id], "Request is invalid or already fulfilled.");

        results[id] = gramCo2PerKwh;
        delete requests[id];

        emit Co2PerKwhReceived(gramCo2PerKwh, id);
    }

    function getSpotPrice() external {
        require(tradingContextOracle != IRandOracle(address(0)), "Oracle not initialized.");

        uint256 id = tradingContextOracle.requestSpotPrice();
        requests[id] = true;

        emit SpotPriceRequested(id);
    }

    function fulfillSpotPriceRequest(uint256 spotPrice, uint256 id) external onlyRandOracle {
        require(requests[id], "Request is invalid or already fulfilled.");

        results[id] = spotPrice;
        delete requests[id];

        emit SpotPriceReceived(spotPrice, id);
    }

    event OracleAddressChanged(address oracleAddress);

    event Co2PricePerTonRequested(uint256 id);
    event Co2PricePerTonReceived(uint256 number, uint256 id);
    
    event Co2PerKwhRequested(uint256 id);
    event Co2PerKwhReceived(uint256 number, uint256 id);
    
    event SpotPriceRequested(uint256 id);
    event SpotPriceReceived(uint256 number, uint256 id);
}
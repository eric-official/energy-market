// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ICaller.sol";

contract TradingContextOracle is AccessControl {
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");

    uint private numProviders = 0;
    uint private providersThreshold = 1;
    uint private randNonce = 1000;

    mapping(uint256=>bool) private pendingRequests;

    struct ResponseCo2Price {
        address providerAddress;
        address callerAddress;
        uint256 price;
    }

    struct ResponseCo2PerKwh {
        address providerAddress;
        address callerAddress;
        uint256 co2PerKwh;
    }

    struct ResponseSpotPrice {
        address providerAddress;
        address callerAddress;
        uint256 co2PerKwh;
    }


    mapping(uint256=>ResponseCo2Price[]) private idToResponsesPrice;
    mapping(uint256=>ResponseCo2PerKwh[]) private idToResponsesCo2PerKwh;
    mapping(uint256=>ResponseSpotPrice[]) private idToResponsesSpotPrice;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // make the deployer admin
    }

    function setCo2PricePerTon(uint256 price, address callerAddress, uint256 id) public {
        require(pendingRequests[id], "Request not found.");

        // Add newest response to list
        ResponseCo2Price memory res = ResponseCo2Price(msg.sender, callerAddress, price);
        idToResponsesPrice[id].push(res);
        uint numResponses = idToResponsesPrice[id].length;
        // Check if we've received enough responses
        if (numResponses == providersThreshold) {
           
            // Clean up
            delete pendingRequests[id];
            delete idToResponsesPrice[id];

            // Fulfill request
            ICaller(callerAddress).fulfillCo2PricePerTonRequest(price, id);

            emit Co2PricePerTonReturned(price, callerAddress, id);
        }
    }

    function requestCo2PricePerTon() external returns (uint256) {
        require(numProviders > 0, " No data providers not yet added.");

        randNonce++;
        uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 1000;
        pendingRequests[id] = true;

        emit Co2PricePerTonRequested(msg.sender, id);
        return id;
    }

    function setGramCo2PerKwh(uint256 gram, address callerAddress, uint256 id) public {
        require(pendingRequests[id], "Request not found.");

        // Add newest response to list
        ResponseCo2PerKwh memory res = ResponseCo2PerKwh(msg.sender, callerAddress, gram);
        idToResponsesCo2PerKwh[id].push(res);
        uint numResponses = idToResponsesCo2PerKwh[id].length;
        // Check if we've received enough responses
        if (numResponses == providersThreshold) {
           
            // Clean up
            delete pendingRequests[id];
            delete idToResponsesCo2PerKwh[id];

            // Fulfill request
            ICaller(callerAddress).fulfillGramCo2PerKwhRequest(gram, id);

            emit Co2PerKwhReturned(gram, callerAddress, id);
        }
        
    }

    function requestGramCo2PerKwh() external returns (uint256) {
        require(numProviders > 0, " No data providers not yet added.");

        randNonce++;
        uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 1000;
        pendingRequests[id] = true;

        emit Co2PerKwhRequested(msg.sender, id);
        return id;
    }

    function setSpotPrice(uint256 spotPrice, address callerAddress, uint256 id) public {
         require(pendingRequests[id], "Request not found.");

        // Add newest response to spotPrice
        ResponseSpotPrice memory res = ResponseSpotPrice(msg.sender, callerAddress, spotPrice);
        idToResponsesSpotPrice[id].push(res);
        uint numResponses = idToResponsesSpotPrice[id].length;
        // Check if we've received enough responses
        if (numResponses == providersThreshold) {
           
            // Clean up
            delete pendingRequests[id];
            delete idToResponsesSpotPrice[id];

            // Fulfill request
            ICaller(callerAddress).fulfillSpotPriceRequest(spotPrice, id);

            emit Co2PerKwhReturned(spotPrice, callerAddress, id);
        } 
    }

    function requestSpotPrice() external returns (uint256) {
        require(numProviders > 0, " No data providers not yet added.");

        randNonce++;
        uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 1000;
        pendingRequests[id] = true;

        emit SpotPriceRequested(msg.sender, id);
        return id;
    }

    // Admin functions
    function addProvider(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!hasRole(PROVIDER_ROLE, provider), "Provider already added.");

        _grantRole(PROVIDER_ROLE, provider);
        numProviders++;

        emit ProviderAdded(provider);
    }

    function removeProvider(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!hasRole(PROVIDER_ROLE, provider), "Address is not a recognized provider.");
        require (numProviders > 1, "Cannot remove the only provider.");

        _revokeRole(PROVIDER_ROLE, provider);
        numProviders--;

        emit ProviderRemoved(provider);
    }

    function setProvidersThreshold(uint threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(threshold > 0, "Threshold cannot be zero.");

        providersThreshold = threshold;
        emit ProvidersThresholdChanged(providersThreshold);
    }

    // Events
    event Co2PricePerTonRequested(address callerAddress, uint id);
    event Co2PricePerTonReturned(uint256 co2PricePerTon, address callerAddress, uint id);
    
    event Co2PerKwhRequested(address callerAddress, uint id);
    event Co2PerKwhReturned(uint256 co2PricePerKwh, address callerAddress, uint id);
        
    event SpotPriceRequested(address callerAddress, uint id);
    event SpotPriceReturned(uint256 spotPrice, address callerAddress, uint id);

    event ProviderAdded(address providerAddress);
    event ProviderRemoved(address providerAddress);
    event ProvidersThresholdChanged(uint threshold);

}
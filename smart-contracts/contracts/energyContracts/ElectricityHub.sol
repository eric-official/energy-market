// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;
import "./ElectricityAuction.sol";

// Facilitates trading 
contract ElectricityHub {
    struct Auction {
        uint256 start;
        ElectricityAuction auction;
    }

    Auction[] private currentAuctions;
    uint256 public upgradeInterval = 1 minutes;

    // For renewable distribution
    address[] private renewableProviders;
    mapping(address => uint256) private provisionedElectricity;
    uint256 private totalkwH;
    
    event AuctionStarted(uint256 kwhAmount, address indexed newContract);

    address private owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Function can only be invoked by the owner,");
        _;
    }

    /**
    * End mature auction and remove from current active auctions.
    */
    function endMatureAuctions() external onlyOwner {
        for (uint32 i; i < currentAuctions.length; i++) {
            Auction memory auction = currentAuctions[i];
            if (block.timestamp <= auction.start + upgradeInterval) {
                auction.auction.endAuction();
                delete currentAuctions[i];
            }
        }
    }

    /**
    * Get all active auctions that can be participated in.
    */
    function getCurrentAuctions() external view returns(Auction[] memory) {        
        return currentAuctions;
    }

    /**
    * Provide energy to the market and start a new auction.
    * @param kwhAmount The amount that will be provisioned to the grid.
    * @param isRenewable Flag that indicates if the provided electricity is from a renewable source.
    */
    function provide(uint256 kwhAmount, bool isRenewable) external {
        ElectricityAuction newAuction = new ElectricityAuction(kwhAmount, msg.sender, isRenewable); 
        currentAuctions.push(Auction(block.timestamp, newAuction));
        emit AuctionStarted(kwhAmount, address(newAuction));
    }

    /**
    * Add the provided energy for provider and, if applicable, add them to the pool.
    */
    function changeProvidedEnergy(address provider, uint256 kwhAmount) external {
        bool invokedByAuction = false;
        for (uint32 i; i < currentAuctions.length && !invokedByAuction; i++) {
            invokedByAuction = invokedByAuction || msg.sender == address(currentAuctions[i].auction);            
        }

        totalkwH += kwhAmount;
        if (provisionedElectricity[provider] == 0) {
            renewableProviders.push(provider);
        }
        provisionedElectricity[provider] += kwhAmount;
    }

    /**
    * Distributes the stored premium amount the providers.    
    */
    function distributePremium() external payable onlyOwner {

        uint256 balance = address(this).balance;

        for (uint256 i = 0; i < renewableProviders.length; i++) {
            address provider = renewableProviders[i];
            uint256 kwhProvided = provisionedElectricity[provider];
            uint256 provisionedFactor = kwhProvided / totalkwH;

            // Transfer part of the overall premium 
            payable(provider).transfer(balance * provisionedFactor);

            // Reset provided value
            delete provisionedElectricity[provider];
        }

        totalkwH = 0;
        renewableProviders = new address[](0);
    }
}
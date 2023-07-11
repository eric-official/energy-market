// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;
import "./Caller.sol";
import "hardhat/console.sol";
import "./ElectricityHub.sol";

// Facilitate auction with Vickrey strategy 
contract ElectricityAuction {
    struct Bid {
        address payable bidder;
        uint256 bidPerKwh;
    }
    Caller tradingContext;

    mapping(address => Bid) participatedInAuction;
    address[] private participants;

    uint256 secondHighestBid = 0; // The spot price determined by the Vickrey auction
    address winner = address(0);
    bool auctionActive = true;
    uint256 kwhOffered;
    address payable auctioneer;
    bool isRenewable;
    ElectricityHub electricityHub;

    bool auctionPayed = false;

    event AuctionEnded(uint256 price, address winner);
    event AuctionCollected();
    Caller.ElectricityData contextData;

    constructor(uint256 _kwhOffered, address _auctioneer, bool _isRenewable, address callerAddress) {
        kwhOffered = _kwhOffered;
        auctioneer = payable(_auctioneer);
        isRenewable = _isRenewable;
        electricityHub = ElectricityHub(msg.sender);
        tradingContext = Caller(callerAddress);
        contextData = tradingContext.getElectricityData();
    }

    modifier onlyOwner {
        require(msg.sender == address(electricityHub), "Function can only be invoked by the owner,");
        _;
    }

    modifier onlyActiveAuction {
        require(auctionActive, "Function can only be executed when auction is active.");
        _;
    }

    modifier onlyEndedAuction {
        require(!auctionActive, "Function can only be executed when auction has ended.");
        _;
    }

    function getPriceForThisAuction() public view onlyEndedAuction returns(uint256) {
        return kwhOffered * secondHighestBid + this.getPremium();
    }

    /**
    * Bid for energy.
    */
    function bid() external payable onlyActiveAuction {
        uint256 premium = getPremium();
        require(msg.value >= premium, "Value should at least cover the premium paid for the auction.");

        participatedInAuction[msg.sender] = Bid(payable(msg.sender), (msg.value - premium)/ kwhOffered);
        participants.push(msg.sender);
    }

    /**
    * End the auction and transfer funds to non-winners.
    */
    function endAuction() payable external onlyOwner {
        auctionActive = false;
        uint256 localHighestBid = 0;  
        uint256 localSecondHighestBid = 0; 
        Bid memory currentBid;
        address localWinner = address(0);

        // Find the second highest bid and the winner
        for (uint256 i = 0; i < participants.length; i++) {            
            currentBid = participatedInAuction[participants[i]];
            address bidderAddress = currentBid.bidder;
            uint256 bidderBid = currentBid.bidPerKwh;
            
            // Find the winner
            if (bidderBid > localHighestBid) {
                localWinner = bidderAddress;
                localSecondHighestBid = localHighestBid;  // Assign the old highest bid to second highest bid before updating the highest bid
                localHighestBid = bidderBid;
            } else if (bidderBid > localSecondHighestBid && bidderBid < localHighestBid) {
                // Update the second highest bid if the current bid is lower than the highest and higher than the current second highest
                localSecondHighestBid = bidderBid;
            }
            secondHighestBid = localSecondHighestBid;  
        }     

        winner = localWinner;      
        
        // Transfer funds back to non-winners
        for (uint256 i = 0; i < participants.length; i++) {  
            currentBid = participatedInAuction[participants[i]];
            address payable bidderAddress = currentBid.bidder;
            if (bidderAddress != localWinner) {
                bidderAddress.transfer(currentBid.bidPerKwh * kwhOffered);
            }
        }

        emit AuctionEnded(secondHighestBid, winner);
    }

    function collect() external payable onlyEndedAuction {
        require(msg.sender == winner, "Only the winner can collect the auction price.");     
        
        electricityHub.setEnergyBalance(msg.sender, kwhOffered);
        auctionPayed = true;
        if (isRenewable) {
            uint256 overallPrice = getPriceForThisAuction();
            electricityHub.changeProvidedEnergy(auctioneer, kwhOffered);
            auctioneer.transfer(overallPrice);
        } else {
            auctioneer.transfer(secondHighestBid * kwhOffered);
            // remainingBalance = address(this).balance;    
            // (bool success, ) = payable(address(electricityHub)).call{value: remainingBalance}("");
            // require(success, "Transfer failed");    
        }        

        emit AuctionCollected();
    }


    /**
    * Calculates the premium depending on the usage and the oracle data.
    */
    function getPremium() public view returns(uint256) {
        return kwhOffered * contextData.priceCarbon * contextData.carbonIntensity / 1000;
    }

}
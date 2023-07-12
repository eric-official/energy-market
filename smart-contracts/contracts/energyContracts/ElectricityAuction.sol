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
    event BidPlaced(address bidder, uint256 bidPerKwh);
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

    function priceForThisAuction() public view onlyEndedAuction returns(uint256) {
        return kwhOffered * secondHighestBid + this.getPremium(kwhOffered);
    }

    /**
    * Bid for energy.
    */
    function bid() external payable onlyActiveAuction {
        uint totalPrice = getPrice(kwhOffered);
        require(msg.value >= totalPrice);
        participatedInAuction[msg.sender] = Bid(payable(msg.sender), msg.value / kwhOffered);
        participants.push(msg.sender);
        emit BidPlaced(msg.sender, msg.value / kwhOffered);
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
        uint256 alreadySentFunds = kwhOffered * participatedInAuction[msg.sender].bidPerKwh;
        uint256 overallPrice = getPrice(kwhOffered);

        int256 fundsDifference = int256(overallPrice) - int256(alreadySentFunds + msg.value);
        require(fundsDifference <= 0, "Insufficient balance.");

        if (fundsDifference < 0) {
            uint256 refundAmount = uint256(-fundsDifference);
            payable(msg.sender).transfer(refundAmount);
        }

        if (isRenewable) {
            auctioneer.transfer(overallPrice);
            electricityHub.changeProvidedEnergy(auctioneer, kwhOffered);
        } else {
            auctioneer.transfer(secondHighestBid * kwhOffered);
            payable(address(electricityHub)).transfer(getPremium(kwhOffered));
        }
        
        electricityHub.setEnergyBalance(msg.sender, kwhOffered);

        auctionPayed = true;
        emit AuctionCollected();
    }

    /**
    * Calculates the overall price depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPrice(uint256 amountInKwH) public view returns(uint256) {
        return secondHighestBid * amountInKwH + getPremium(amountInKwH);
    }

    function getAuctionEnergy() public view returns(uint256) {
        return kwhOffered;
    }
    /**
    * Calculates the premium depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPremium(uint256 amountInKwH) public view returns(uint256) {
        return amountInKwH * contextData.priceCarbon * contextData.carbonIntensity / 1000;
    }

}
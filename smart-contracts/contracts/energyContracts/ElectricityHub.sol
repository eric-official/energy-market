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
    mapping(address => bool) isAuction;
    mapping(address => uint256) public energyBalance;

    // For renewable distribution
    address[] private renewableProviders;
    mapping(address => uint256) private provisionedElectricity;
    uint256 private totalkwH;
    address callerAddress;

    event AuctionStarted(uint256 kwhAmount, address indexed newContract);
    event Auctionmatured(address indexed auction);
    event ElectricityUsed(uint256 usedKwh, address indexed consumer);
    event PremiumDistributed(address indexed provider, uint256 amount);

    address private owner;

    constructor(address callerAddressInit) {
        owner = msg.sender;
        callerAddress = callerAddressInit;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Function can only be invoked by the owner,"
        );
        _;
    }

    modifier onlyAuction() {
        require(
            isAuction[msg.sender],
            "Change provided energy is only invokable by an auction."
        );
        _;
    }

    /**
     * End mature auction and remove from current active auctions.
     */
    function endMatureAuctions() external onlyOwner {
        for (uint32 i = 0; i < currentAuctions.length; i++) {
            Auction storage auction = currentAuctions[i];
            if (
                block.timestamp > auction.start + upgradeInterval &&
                address(auction.auction) != address(0)
            ) {
                auction.auction.endAuction();
                emit Auctionmatured(address(auction.auction));
                delete currentAuctions[i];
            }
        }
    }

    /**
     * Get all active auctions that can be participated in.
     */
    function getCurrentAuctions() external view returns (Auction[] memory) {
        return currentAuctions;
    }

    /**
     * Provide energy to the market and start a new auction.
     * @param kwhAmount The amount that will be provisioned to the grid.
     * @param isRenewable Flag that indicates if the provided electricity is from a renewable source.
     */
    function provide(uint256 kwhAmount, bool isRenewable) external {
        ElectricityAuction newAuction = new ElectricityAuction(
            kwhAmount,
            msg.sender,
            isRenewable,
            callerAddress
        );
        isAuction[(address(newAuction))] = true;
        currentAuctions.push(Auction(block.timestamp, newAuction));
        emit AuctionStarted(kwhAmount, address(newAuction));
    }

    function setEnergyBalance(
        address consumer,
        uint256 kwhAmount
    ) external payable onlyAuction {
        energyBalance[consumer] = energyBalance[consumer] + kwhAmount;
    }

    function decreaseEnergyBalance(uint256 kwhAmount) external {
        address consumer = msg.sender;
        require(
            energyBalance[consumer] >= kwhAmount,
            "The energy balance must be greater or equals the consumed amount."
        );
        energyBalance[consumer] = energyBalance[consumer] - kwhAmount;
        emit ElectricityUsed(energyBalance[consumer], consumer);
    }

    function getEnergyBalance(
        address consumer
    ) external view returns (uint256) {
        return energyBalance[consumer];
    }

    /**
     * Add the provided energy for provider and, if applicable, add them to the pool.
     */
    function changeProvidedEnergy(
        address provider,
        uint256 kwhAmount
    ) external onlyAuction {
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
            emit PremiumDistributed(provider, balance * provisionedFactor);
            // Reset provided value
            delete provisionedElectricity[provider];
        }

        totalkwH = 0;
        renewableProviders = new address[](0);
    }

    event Received(address sender, uint amount);

    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}

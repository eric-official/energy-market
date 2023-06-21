// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;
import "./RenewableProviderPool.sol";
import "./BaseFeePool.sol";
import "hardhat/console.sol";

contract ElectricityTradingHub {

    // Collapse smart contract to safe tx-costs --------------

    // For renewable distribution
    address[] private renewableProviders;
    mapping(address => uint32) private provisionedElectricity;
    uint32 private totalkwH;
    
    // For base fee distributions
    address[] private baseFeeProviders;
    mapping(address => uint256) private energyPriceClaim;
    
    // -------------------------------------------------------

    Caller tradingContext;
    // uint16 co2PricePerTonInCent = 80 * 100;
    // uint16 gramCo2PerKwH = 233;
    // uint16 spotPriceInCent = 30;

    struct Provisioning {
        address payable provider;
        uint32 kwhAmount;
        bool isRenewable;
    }

    struct Queue {
        mapping(uint256 => Provisioning) data;
        uint256 front;
        uint256 rear;
        uint256 len;
    }

    Queue queue;

    address owner;

    constructor() payable {
        // Set the calling EOA as distributer for triggering the distirubtion of the premium
        renewableProviderPool = new RenewableProviderPool(msg.sender);
        queue.front = 1;
        queue.rear = 0;
        queue.len = 0;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Function can only be invoked by");
        _;
    }

    /**
    * Enqueues a provider.
    *
    * @param value the context data like address, if renewable and how much energy is provisioned
    */
    function enqueue(Provisioning memory value) public {
        queue.rear += 1;
        queue.data[queue.rear] = value;
        queue.len += 1;
    }

    /**
    * Dequeues a provider.
    *
    * @return the context data for energy provisioning
    */
    function dequeue() public returns (Provisioning memory) {
        require(queue.rear >= queue.front, "Queue is empty");

        Provisioning memory value = queue.data[queue.front];
        delete queue.data[queue.front];
        queue.front += 1;
        queue.len -= 1;

        return value;
    }

    function getQueueLength() public view returns (uint256) {
        return queue.rear - queue.front + 1;
    }

    function getQueue() public view returns (Provisioning[] memory) {
        Provisioning[] memory dataArray = new Provisioning[](queue.len);
        for(uint i = 0; i < queue.len; i++) {
            dataArray[i] = queue.data[i];
        }
        return dataArray;
    }

    function getCo2PricePerTon() public view returns (uint16) {
        return this.tradingContext.requestCo2PricePerTon();
    }

    function getGramCo2PerKwH() public view returns (uint16) {
        return this.tradingContext.requestGramCo2PerKwh();
    }

    function getSpotPrice() public view returns (uint16) {
        return this.tradingContext.requestSpotPrice();
    }

    /**
    * Calculates the overall price depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPrice(uint32 amountInKwH) public view returns(uint32) {
        return getBasePrice(amountInKwH) + getPremium(amountInKwH);
    }

    function getBasePrice(uint32 amountInKwH) public view returns(uint32) {
        return amountInKwH * getSpotPriceInCent();
    }

    /**
    * Calculates the premium depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPremium(uint32 amountInKwH) public view returns(uint32) {
        return amountInKwH * getCo2PricePerTon() * getGramCo2PerKwH() / 1000;
    }

    /**
    * Consumes energy.
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function consume(uint32 amountInKwH) public payable {
        uint totalPrice = getPrice(amountInKwH);

        require(msg.value >= totalPrice);
        uint32 consumedKwH = 0;
        uint32 lastConsumedAmount = 0;

        while (consumedKwH != amountInKwH) {
            require(queue.front != queue.back, "Energy consumption unsatiable. Only " + consumedKwH + " can be provided.");

            Provisioning memory provisioning = dequeue();
            if (amountInKwH - consumedKwH >= provisioning.kwhAmount) {
                consumedKwH += provisioning.kwhAmount;       
            } else {
                // Decrease rest energy needed (this is the last loop iteration)
                provisioning.kwhAmount -= amountInKwH - consumedKwH;
                consumedKwH += amountInKwH - consumedKwH;

                // Put the provisioning back at the end of the queue
                enqueue(provisioning); 
            }

            uint32 price = 0;
            uint32 loopDelta = consumedKwH - lastConsumedAmount;
            if (provisioning.isRenewable) {
                // Add provided energy to pool for later distrrubtion
                uint32 premium = getPremium(loopDelta);     
                changeProvidedEnergy(msg.sender, loopDelta);
            } 

            addBaseFeeClaim(provisioning.provider, getBasePrice(loopDelta));
            lastConsumedAmount = consumedKwH;
        }
    }

    /**
    * Provides energy provisioning.
    *
    * @param kwhAmount   the amount of kilowatt-hours to be provisioned
    * @param isRenewable a flag indicating whether the energy is renewable or not
    */
    function provide(uint32 kwhAmount, bool isRenewable) public {
        Provisioning memory provisioning = Provisioning(
            payable(msg.sender),
            kwhAmount,
            isRenewable
        );

        enqueue(provisioning);
    }

    // Helper functions for base fee + premium distribution ------------------------

    /**
    * Add the provided energy for provider and, if applicable, add them to the pool.
    */
    function addBaseFeeClaim(address provider, uint256 baseFee) {
  
        if (energyPriceClaim[provider] == 0) {
            providers.push(provider);
        }
        energyPriceClaim[provider] += baseFee;
    }

    /**
    * Distributes the stored premium amount the providers.    
    */
    function distributeBaseFee() public payable onlyOwner {

        for (uint256 i = 0; i < baseFeeProviders.length; i++) {
            address payable provider = payable(baseFeeProviders[i]);
            uint256 claim = energyPriceClaim[provider];

            // Transfer part of the overall premium 
            provider.transfer(claim);

            // Reset provided value
            delete energyPriceClaim[provider];
        }

        providers = new address[](0);
    }


    /**
    * Add the provided energy for provider and, if applicable, add them to the pool.
    */
    function changeProvidedEnergy(address provider, uint32 kwhAmount)  {
        totalkwH += kwhAmount;
        if (provisionedElectricity[provider] == 0) {
            providers.push(provider);
        }
        provisionedElectricity[provider] += kwhAmount;
    }

    /**
    * Distributes the stored premium amount the providers.    
    */
    function distributePremium() public payable onlyOwner {

        uint256 balance = address(this).balance;

        for (uint256 i = 0; i < renewableProviders.length; i++) {
            address provider = renewableProviders[i];
            uint32 kwhProvided = provisionedElectricity[provider];
            uint32 provisionedFactor = kwhProvided / totalkwH;

            // Transfer part of the overall premium 
            payable(provider).transfer(balance * provisionedFactor);

            // Reset provided value
            delete provisionedElectricity[provider];
        }

        totalkwH = 0;
        renewableProviders = new address[](0);
    }

}
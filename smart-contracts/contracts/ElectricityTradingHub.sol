// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;
import "contracts/RenewableProviderPool.sol";

contract ElectricityTradingHub {

    RenewableProviderPool private pool;
    // Stub variable; Subsititute with oracles
    uint16 private co2PricePerTonInCent = 80 * 100;
    uint16 private gramCo2PerKwH = 233;
    uint16 private spotPriceInCent = 30;

    struct Provisioning {
        address payable provider;
        uint32 kwhAmount;
        bool isRenewable;
    }

    struct Queue {
        Provisioning[] data;
        mapping(uint256 => bool) exists;
        uint256 front;
        uint256 rear;
    }
    
    Queue private queue;

    constructor() {
        // Set the calling EOA as distributer for triggering the distirubtion of the premium
        pool = new RenewableProviderPool(msg.sender);
    }

    /**
    * Enqueues a provider.
    *
    * @param value the context data like address, if renewable and how much energy is provisioned
    */
    function enqueue(Provisioning memory value) private {
        queue.data.push(value);
        queue.exists[queue.data.length - 1] = true;
        queue.rear = queue.data.length - 1;
    }

    /**
    * Dequeues a provider.
    *
    * @return the context data for energy provisioning
    */
    function dequeue() private returns (Provisioning memory) {
        require(!isEmpty(), "Queue is empty");
        
        uint256 front = queue.front;
        delete queue.exists[front];
        queue.front++;
        
        return queue.data[front];
    }

    function isEmpty() private view returns (bool) {
        return queue.front > queue.rear || queue.data.length == 0;
    }

    function getQueueLength() private view returns (uint256) {
        return queue.rear - queue.front + 1;
    }
    
    /**
    * Calculates the overall price depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPriceInCents(uint32 amountInKwH) private view returns(uint32) {
        return amountInKwH * spotPriceInCent + getPremium(amountInKwH);
    }

    /**
    * Calculates the premium depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPremium(uint32 amountInKwH) private view returns(uint32) {
        return amountInKwH * co2PricePerTonInCent * gramCo2PerKwH / 1000;
    }

    /**
    * Consumes energy.
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function consume(uint32 amountInKwH) public payable{
        uint totalPrice = getPriceInCents(amountInKwH);

        require(msg.value >= totalPrice);
        
        for (uint256 i = queue.front; i <= queue.rear && amountInKwH >= 0; i++) {
            require(queue.exists[i], "Not enough energy providers in the network.");
            Provisioning memory provisioning = dequeue();

            uint32 consumedKwH = 0;
            if (amountInKwH - provisioning.kwhAmount >= 0) {
                consumedKwH = provisioning.kwhAmount;
                amountInKwH -= provisioning.kwhAmount;
            } else {
                consumedKwH = amountInKwH;
                provisioning.kwhAmount = provisioning.kwhAmount - amountInKwH;

                // Update the
                enqueue(provisioning);
            }

            uint32 price = 0;
            if (provisioning.isRenewable) {
                price = getPriceInCents(amountInKwH);
                pool.changeProvidedEnergy(msg.sender, consumedKwH);
            } else {
                price = amountInKwH * spotPriceInCent;
                // Add kwh amount to renewable pool
                pool.addResidualPremium(price);
            }

            provisioning.provider.transfer(price);
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
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;
import "./RenewableProviderPool.sol";
import "hardhat/console.sol";

contract ElectricityTradingHub {

    RenewableProviderPool pool;
    // Stub variable; Subsititute with oracles
    uint16 co2PricePerTonInCent = 80 * 100;
    uint16 gramCo2PerKwH = 233;
    uint16 spotPriceInCent = 30;

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
    mapping(address => uint32) public energyBalance;

    event Provide(address indexed provider, uint32 kwhAmount, bool isRenewable, uint256 timestamp);
    event Consume(address indexed consumer, address indexed provider, uint32 kwhAmount, bool isRenewable, uint256 timestamp);
    event Use(address indexed consumer, uint32 kwhAmount, uint256 timestamp);

    constructor() payable {
        // Set the calling EOA as distributer for triggering the distirubtion of the premium
        pool = new RenewableProviderPool(msg.sender);
        queue.front = 1;
        queue.rear = 0;
        queue.len = 0;
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

    function getAccountEnergyBalance(address connectedAccount) public view returns (uint32) {
        return energyBalance[connectedAccount];
    }

    function getCo2PricePerTonInCent() public view returns (uint16) {
        return co2PricePerTonInCent;
    }

    function getGramCo2PerKwH() public view returns (uint16) {
        return gramCo2PerKwH;
    }

    function getSpotPriceInCent() public view returns (uint16) {
        return spotPriceInCent;
    }

    /**
    * Calculates the overall price depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPriceInCents(uint32 amountInKwH) public view returns(uint32) {
        return amountInKwH * spotPriceInCent + getPremium(amountInKwH);
    }

    /**
    * Calculates the premium depending on the usage and the oracle data
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function getPremium(uint32 amountInKwH) public view returns(uint32) {
        return amountInKwH * co2PricePerTonInCent * gramCo2PerKwH / 1000;
    }

    /**
    * Consumes energy.
    *
    * @param amountInKwH the amount of kilowatt-hours to consume
    */
    function consume(address connectedAccount, uint32 amountInKwH) public payable {
        uint totalPrice = 1000000000000 wei;

        require(msg.value >= totalPrice);
        uint32 consumedKwH = 0;
        Provisioning memory provisioning = queue.data[queue.front];
        while (consumedKwH != amountInKwH) {
            if (amountInKwH  - consumedKwH >= provisioning.kwhAmount) {
                consumedKwH += provisioning.kwhAmount - consumedKwH;
                dequeue();
                provisioning = queue.data[queue.front];
            } else {
                queue.data[queue.front].kwhAmount = provisioning.kwhAmount - amountInKwH + consumedKwH;
                provisioning.kwhAmount -= amountInKwH - consumedKwH;
                consumedKwH += amountInKwH - consumedKwH;

            }
        }

        provisioning.provider.transfer(totalPrice);
        pool.changeProvidedEnergy(connectedAccount, consumedKwH);
        energyBalance[connectedAccount] += amountInKwH;

        emit Consume(connectedAccount, provisioning.provider, amountInKwH, provisioning.isRenewable, block.timestamp);

    }

    function use(address connectedAccount, uint32 kwhAmount) public {
        if (kwhAmount > energyBalance[connectedAccount]) {
            kwhAmount = energyBalance[connectedAccount];
        }
        energyBalance[connectedAccount] -= kwhAmount;
        emit Use(connectedAccount, kwhAmount, block.timestamp);
    }

    /**
    * Provides energy provisioning.
    *
    * @param kwhAmount   the amount of kilowatt-hours to be provisioned
    * @param isRenewable a flag indicating whether the energy is renewable or not
    */
    function provide(address connectedAccount, uint32 kwhAmount, bool isRenewable) public {
        Provisioning memory provisioning = Provisioning(
            payable(connectedAccount),
            kwhAmount,
            isRenewable
        );

        enqueue(provisioning);

        emit Provide(connectedAccount, kwhAmount, isRenewable, block.timestamp);
    }
}
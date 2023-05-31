// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

contract RenewableProviderPool {
    address[] private providers;
    mapping(address => uint32) private provisionedElectricity;
    uint32 private totalkwH;

    address private distributer;
    address private owner;

    constructor(address distribut) {
        distributer = distribut;
        owner = msg.sender;
    }   

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    /**
    * Add the provided energy for provider and, if applicable, add them to the pool.
    */
    function changeProvidedEnergy(address provider, uint32 kwhAmount) public onlyOwner{
        totalkwH += kwhAmount;
        if (provisionedElectricity[provider] == 0) {
            providers.push(provider);
        }
        provisionedElectricity[provider] += kwhAmount;
    }

    /**
    * Adds the residual premium of non renewable providers to the pool.
    */
    function addResidualPremium(uint32 value) public payable onlyOwner{
        require(msg.value >= value);

        // Store the premium value
        payable(address(this)).transfer(value);
    }

    /**
    * Distributes the stored premium amount the providers.    
    */
    function distribute() public payable {

        require(msg.sender == distributer, "Only the distributer can trigger the distribution.");

        uint256 balance = address(this).balance;

        for (uint256 i = 0; i < providers.length; i++) {
            address provider = providers[i];
            uint32 kwhProvided = provisionedElectricity[provider];
            uint32 provisionedFactor = kwhProvided / totalkwH;

            // Transfer part of the overall premium 
            payable(provider).transfer(balance * provisionedFactor);

            // Reset provided value
            provisionedElectricity[provider] = 0;
        }

        totalkwH = 0;
        providers = new address[](0);
    }

}
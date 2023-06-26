import {getContract} from "./BasicQuery";
import { ethAddress, ethABI } from '../utils/constants'
import { ethers } from 'ethers'


// Get PriceInCents from ElectricityTradingHub.sol contract
async function getSpotPriceInCent() {
    const contract = await getContract(ethAddress, ethABI)
    try {
        const spotPriceInCent = await contract.getSpotPriceInCent();
        return Promise.resolve(spotPriceInCent);
    } catch (error) {
        console.error(error);
    }
}

async function getQueueSum() {
    const contract = await getContract(ethAddress, ethABI)
    try {
        const queue = await contract.getQueue();
        let energy_amount = 0;
        for (let i = 0; i < queue.length; i++) {
            energy_amount += Number(queue[i].kwhAmount);
        }
        return Promise.resolve(energy_amount);
    } catch (error) {
        console.error(error);
    }
}

async function getAccountEnergyBalance(connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    try {
        const energy_balance = await contract.getAccountEnergyBalance(connectedAccount);
        return Promise.resolve(energy_balance);
    } catch (error) {
        console.error(error);
    }
}

async function getMonthlySpend(connectedAccount) {
    console.log("test", connectedAccount)
    const contract = await getContract(ethAddress, ethABI)
    try {
        const txs_from_account = contract.filters.Consume(connectedAccount, null);
        const query_results = await contract.queryFilter(txs_from_account);
        let monthly_spend = 0;
        for(let i = 0; i < query_results.length; i++) {
            let time_diff = Number(Math.floor(Date.now() / 1000)) - Number(query_results[i].args[4])
            if(time_diff <= 30 * 24 * 60 * 60) {
                monthly_spend += Number(query_results[i].args[2]);
            }
        }
        monthly_spend = ethers.formatEther(monthly_spend * 1000000000000);
        return Promise.resolve(monthly_spend);
    } catch (error) {
        console.error(error);
    }
}

async function provide(connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    try {
        await contract.provide(connectedAccount, 100, true);
    } catch (error) {
        console.error(error);
    }
}

async function consume(connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    try {
        const overrides = { value: 1000000000000 };
        await contract.consume(connectedAccount, 1, overrides)
    } catch (error) {
        console.error(error);
    }
}


export {
    provide,
    consume,
    getSpotPriceInCent,
    getQueueSum,
    getAccountEnergyBalance,
    getMonthlySpend
}
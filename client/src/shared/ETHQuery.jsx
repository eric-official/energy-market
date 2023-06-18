import {getContract} from "./BasicQuery";
import { ethAddress, ethABI } from '../utils/constants'

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

async function provide() {
    const contract = await getContract(ethAddress, ethABI)
    console.log(contract)
    try {
        await contract.provide(100, true);
    } catch (error) {
        console.error(error);
    }
}

async function consume() {
    const contract = await getContract(ethAddress, ethABI)
    try {
        await contract.consume(100);
    } catch (error) {
        console.error(error);
    }
}



export {
    provide,
    consume,
    getSpotPriceInCent,
    getQueueSum
}
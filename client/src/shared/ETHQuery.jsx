import {getContract} from "./BasicQuery";
import { ethAddress, ethABI } from '../utils/constants'
import { ethers } from 'ethers'
import React, { useEffect, useState  } from "react";



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

async function use(connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    try {
        //const kwhAmount = Math.floor(Math.random() * 5);
        await contract.use(connectedAccount, 1)
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

async function getMonthlyTrafficData(connectedAccount){
    const contract = await getContract(ethAddress, ethABI)
    try {
        const consume_filter = contract.filters.Consume(connectedAccount, null);
        const consume_query = await contract.queryFilter(consume_filter);
        const use_filter = contract.filters.Use(connectedAccount);
        const use_query = await contract.queryFilter(use_filter);

        let all_queries = consume_query.concat(use_query);
        all_queries.sort(function(a,b) {
            let time_index_a = 0;
            let time_index_b = 0;
            if (a.fragment.name === "Consume") {
                time_index_a = 4
            } else {
                time_index_a = 2
            }

            if (b.fragment.name === "Consume") {
                time_index_b = 4
            } else {
                time_index_b = 2
            }
            return Number(b.args[time_index_b]) - Number(a.args[time_index_a])
        });

        let current_energy_balance = parseInt(await contract.getAccountEnergyBalance(connectedAccount));

        let monthly_traffic_data = [];
        let monthly_traffic_labels = [];

        monthly_traffic_data.push(current_energy_balance);
        const current_time = Date.now()
        let current_date = new Date(current_time);
        current_date = current_date.toISOString()
        monthly_traffic_labels.push(current_date)

        for (let i = 0; i < all_queries.length; i++) {

            let time_index = 0;
            let amount_index = 0;

            if (all_queries[i].fragment.name === "Consume") {
                time_index = 4
                amount_index = 2
                current_energy_balance -= parseInt(all_queries[i].args[amount_index]);
            } else {
                time_index = 2
                amount_index = 1
                current_energy_balance += parseInt(all_queries[i].args[amount_index]);
            }

            if (Date.now() - parseInt(all_queries[i].args[time_index]) * 1000 < 30 * 24 * 60 * 60 * 1000) {
                monthly_traffic_data.unshift(current_energy_balance);
                let query_date = new Date(parseInt(all_queries[i].args[time_index]) * 1000);
                query_date = query_date.toISOString()
                monthly_traffic_labels.unshift(query_date)
            }

        }

        const queryResults = {"data": monthly_traffic_data, "labels": monthly_traffic_labels}
        return Promise.resolve(queryResults);
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
    getMonthlySpend,
    use,
    getMonthlyTrafficData,
}
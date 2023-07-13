import { getContract, getLogs } from "./BasicQuery";
import { ethAddress, ethABI, auctionABI } from '../utils/constants'
import { ethers } from 'ethers'
import React, { useEffect, useState } from "react";



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
        const energy_balance = await contract.getEnergyBalance(connectedAccount);
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
        for (let i = 0; i < query_results.length; i++) {
            let time_diff = Number(Math.floor(Date.now() / 1000)) - Number(query_results[i].args[4])
            if (time_diff <= 30 * 24 * 60 * 60) {
                monthly_spend += Number(query_results[i].args[2]);
            }
        }
        monthly_spend = ethers.formatEther(monthly_spend * 1000000000000);
        return Promise.resolve(monthly_spend);
    } catch (error) {
        console.error(error);
    }
}

async function provide(energy_amount, isRenewable, connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    const energyAmountInt = parseInt(energy_amount);
    console.log("Providing Electricity:", energyAmountInt)
    try {
        await contract.provide(energyAmountInt, isRenewable);
    } catch (error) {
        console.error(error);
    }
}

async function use(useEnergy, min, max, connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    let energyBalance = await contract.getEnergyBalance(connectedAccount)
    let energyBalanceNumber = parseInt(energyBalance.toString());

    if (useEnergy <= energyBalanceNumber && energyBalanceNumber > 0) {
        console.log("Enough electricity in reserve. Using Electricity...")
        await contract.decreaseEnergyBalance(useEnergy);
        energyBalance = await contract.getEnergyBalance(connectedAccount);
        console.log("Energy used. Remaining energy:", ethers.formatUnits(energyBalance, 'wei'));
        useEnergy = 0
    }
    if (energyBalance < 5) {
        console.log("Electricity below threshold. Not enough energy... Starting bidding")
        const openAuctions = await contract.getCurrentAuctions()
        const processData = async () => {
            for (let openAuction of openAuctions) {
                if (openAuction[1] != "0x0000000000000000000000000000000000000000") {
                    const auctionContract = await getContract(openAuction[1], auctionABI)
                    let etherToSend = min;
                    let weiToSend = ethers.parseEther(etherToSend.toString());

                    // Call the bid() function and send Ether
                    let transaction = await auctionContract.bid({ value: weiToSend });
                    auctionContract.on('AuctionEnded', async (secondHighestBid, winner, event) => {
                        console.log(`Auction ended with winner: ${winner} and second highest bid: ${secondHighestBid}`);

                        if (winner.toLowerCase() === connectedAccount.toLowerCase()) {
                            console.log("This account has won the auction. Collecting the electricity");

                            // Call the collect function
                            const collectTransaction = await auctionContract.collect();
                            console.log("Collect transaction:", collectTransaction);
                        }
                    });
                    break;
                }
            }
        }
        await processData();

    }
    if (useEnergy != 0 && useEnergy <= energyBalanceNumber && energyBalanceNumber > 0) {
        console.log("Enough electricity in reserve. Using Electricity...")
        await contract.decreaseEnergyBalance(useEnergy);
        energyBalance = await contract.getEnergyBalance(connectedAccount);
        console.log("Energy used. Remaining energy:", ethers.formatUnits(energyBalance, 'wei'));
        useEnergy = 0
    }

}
async function getAuctionData() {
    // Your logic to fetch the data
    const contract = await getContract(ethAddress, ethABI)
    const log_filter = contract.filters.AuctionStarted();
    const consume_query = await contract.queryFilter(log_filter);
    const log_filter1 = contract.filters.Auctionmatured();
    const consume_query1 = await contract.queryFilter(log_filter1);
    const log_filter2 = contract.filters.PremiumDistributed();
    const consume_query2 = await contract.queryFilter(log_filter2);
    const data = []
    consume_query.forEach((log) => {
        data.push({
            "blockNumber": log.blockNumber,
            "energy": String(log.args[0]),
            "status": "Auction Started",
            "address": log.args[1]
        })
    });
    consume_query1.forEach((log) => {
        data.push({
            "blockNumber": log.blockNumber,
            "energy": "-",
            "status": "Auction Ended",
            "address": log.args[0]
        })
    });
    consume_query2.forEach((log) => {
        data.push({
            "blockNumber": log.blockNumber,
            "energy": "-",
            "status": "Premium Distributed",
            "address": log.args[0]
        })
    });

    const returnData = {
        columns: [{
            Header: "BLOCK NUMBER",
            accessor: "blockNumber",
        },
        {
            Header: "ENERGY",
            accessor: "energy",
        },
        {
            Header: "STATUS",
            accessor: "status",
        },
        {
            Header: "AUCTION ADDRESS",
            accessor: "address",
        },],
        data: data
    }
    return returnData

};

async function getBidData() {
    // Your logic to fetch the data
    const contract = await getContract(ethAddress, ethABI)
    const log_filter = contract.filters.AuctionStarted();
    const consume_query = await contract.queryFilter(log_filter);
    const data = []
    const processData = async () => {
        for (let log of consume_query) {
            const auctionAddress = log.args[1];
            const auctionContract = await getContract(auctionAddress, auctionABI);
            const auction_filter = auctionContract.filters.AuctionEnded();
            const auction_query = await auctionContract.queryFilter(auction_filter);
            for (let auctionLog of auction_query) {
                let status = ""
                if (auctionLog.args[1] != "0x0000000000000000000000000000000000000000") {
                    status = "Auction Ended. Winner:" + auctionLog.args[1] + " Price:" + auctionLog.args[0]
                }
                else {
                    status = "Auction Ended. No Winner"
                }
                data.push({
                    "blockNumber": auctionLog.blockNumber,
                    "auction": auctionAddress,
                    "status": status
                })
            };
            const bid_filter = auctionContract.filters.BidPlaced();
            const bid_query = await auctionContract.queryFilter(bid_filter);
            for (let bidLog of bid_query) {
                let status = ""
                status = "Bid Placed. Bidder: " + bidLog.args[0] + " Price:" + ethers.formatEther(bidLog.args[1])

                data.push({
                    "blockNumber": bidLog.blockNumber,
                    "auction": auctionAddress,
                    "status": status
                })
            };

        };
    }
    await processData();
    const returnData = {
        columns: [{
            Header: "BLOCK NUMBER",
            accessor: "blockNumber",
        },
        {
            Header: "AUCTION",
            accessor: "auction",
        },
        {
            Header: "STATUS",
            accessor: "status",
        }],
        data: data
    }
    return returnData

};

async function consume(connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    try {
        const overrides = { value: 1000000000000 };
        await contract.consume(connectedAccount, 1, overrides)
    } catch (error) {
        console.error(error);
    }
}

async function endMatureAuction() {
    const contract = await getContract(ethAddress, ethABI)
    try {
        console.log("Ending mature auctions")
        await contract.endMatureAuctions()
        await contract.distributePremium()

    } catch (error) {
        console.error(error);
    }
}
async function distributePremium() {
    const contract = await getContract(ethAddress, ethABI)
    try {
        await contract.distributePremium()
        console.log("Premium Distributed")
    } catch (error) {
        console.error(error);
    }
}

async function getMonthlyTrafficData(connectedAccount) {
    const contract = await getContract(ethAddress, ethABI)
    try {
        const consume_filter = contract.filters.Consume(connectedAccount, null);
        const consume_query = await contract.queryFilter(consume_filter);
        const use_filter = contract.filters.Use(connectedAccount);
        const use_query = await contract.queryFilter(use_filter);

        let all_queries = consume_query.concat(use_query);
        all_queries.sort(function (a, b) {
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

        const queryResults = { "data": monthly_traffic_data, "labels": monthly_traffic_labels }
        return Promise.resolve(queryResults);
    } catch (error) {
        console.error(error);
    }
}
async function subscribeAuctionData(callback) {
    const contract = await getContract(ethAddress, ethABI)
    contract.on("*", async () => {
        const log_filter = contract.filters.AuctionStarted();
        const consume_query = await contract.queryFilter(log_filter);
        const log_filter1 = contract.filters.Auctionmatured();
        const consume_query1 = await contract.queryFilter(log_filter1);
        const log_filter2 = contract.filters.Auctionmatured();
        const consume_query2 = await contract.queryFilter(log_filter2);
        const data = []
        consume_query.forEach((log) => {
            data.push({
                "blockNumber": log.blockNumber,
                "energy": String(log.args[0]),
                "status": "Auction creation",
                "address": log.args[1]
            })
        });
        consume_query1.forEach((log) => {
            data.push({
                "blockNumber": log.blockNumber,
                "energy": "-",
                "status": "Auction Ended",
                "address": log.args[0]
            })
        });
        consume_query2.forEach((log) => {
            console.log("Premium Distributed logs ",log)
            data.push({
                "blockNumber": log.blockNumber,
                "energy": "-",
                "status": "Premium Distributed",
                "address": log.args[0]
            })
        });
        // Here, we call the callback with the new data instead of returning it
        callback({
            columns: [{
                Header: "BLOCK NUMBER",
                accessor: "blockNumber",
            },
            {
                Header: "ENERGY",
                accessor: "energy",
            },
            {
                Header: "STATUS",
                accessor: "status",
            },
            {
                Header: "AUCTION ADDRESS",
                accessor: "address",
            },],
            data: data
        })
    });
}

async function subscribeBidData(callback) {
    const contract = await getContract(ethAddress, ethABI)
    contract.on("*", async () => {
        const log_filter = contract.filters.AuctionStarted();
        const consume_query = await contract.queryFilter(log_filter);
        const data = []
        const processData = async () => {

            for (let log of consume_query) {
                const auctionAddress = log.args[1];
                const auctionContract = await getContract(auctionAddress, auctionABI);
                const auction_filter = auctionContract.filters.AuctionEnded();
                const auction_query = await auctionContract.queryFilter(auction_filter);
                for (let auctionLog of auction_query) {
                    let status = ""
                    if (auctionLog.args[1] != "0x0000000000000000000000000000000000000000") {
                        status = "Auction Ended. Winner: " + auctionLog.args[1] + " Price: " + auctionLog.args[0]
                    }
                    else {
                        status = "Auction Ended. No Winner"
                    }
                    data.push({
                        "blockNumber": auctionLog.blockNumber,
                        "auction": auctionAddress,
                        "status": status
                    })
                };
                const bid_filter = auctionContract.filters.BidPlaced();
                const bid_query = await auctionContract.queryFilter(bid_filter);
                for (let bidLog of bid_query) {
                    let status = ""
                    status = "Bid Placed. Bidder: " + bidLog.args[0] + " Price:" + ethers.formatEther(bidLog.args[1])

                    data.push({
                        "blockNumber": bidLog.blockNumber,
                        "auction": auctionAddress,
                        "status": status
                    })
                };


            };
        }
        await processData();
        const returnData = {
            columns: [{
                Header: "BLOCK NUMBER",
                accessor: "blockNumber",
            },
            {
                Header: "AUCTION",
                accessor: "auction",
            },
            {
                Header: "STATUS",
                accessor: "status",
            }],
            data: data
        }
        // Here, we call the callback with the new data instead of returning it
        callback(returnData)
    });
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
    getAuctionData,
    subscribeAuctionData,
    endMatureAuction,
    getBidData,
    subscribeBidData,
    distributePremium
}
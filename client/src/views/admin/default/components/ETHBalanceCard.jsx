import Card from "components/card";
import React, { useEffect, useState } from 'react';
import { getBalance } from "../../../../shared/BasicQuery";
import { useGlobalState } from "../../../../shared/dataStore";
import { MdBarChart, MdDashboard } from "react-icons/md";


const ETHBalanceCard = ({ connectedAccount }) => {

    const [balance, setBalance] = useState()
    useEffect(() => {
        let interval = null;
        async function loadBalance(connectedAccount) {
            const eth_balance = await getBalance(connectedAccount)
            setBalance(parseFloat(eth_balance).toFixed(3))
        }
        interval = setInterval(() => {
            loadBalance(connectedAccount);
        }, 5000); // Updates every 10 seconds

        // This function runs when the component unmounts, clearing the interval
        return () => clearInterval(interval);
    }, [connectedAccount])

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
                    <span className="flex items-center text-brand-500 dark:text-white">
                        <MdDashboard className="h-6 w-6" />
                    </span>
                </div>
            </div>

            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">Wallet Balance</p>
                <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                {balance + ""} ETH
                </h4>
            </div>
        </Card>
    );
};

export default ETHBalanceCard;
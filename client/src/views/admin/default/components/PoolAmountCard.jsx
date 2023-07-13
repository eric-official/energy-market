import Card from "components/card";
import React, { useEffect, useState } from 'react';
import { getQueueSum } from "../../../../shared/ETHQuery";
import { isWalletConnected, connectWallet } from "../../../../shared/BasicQuery";

import { IoMdHome } from "react-icons/io";
import { useGlobalState } from "../../../../shared/dataStore"
import { check } from "prettier";



const PoolAmountCard = () => {
    const [connectedAccount, setConnectedAccount] = useGlobalState('connectedAccount')
    useEffect(() => {
        async function checkWallet() {
            await isWalletConnected();
        }
        checkWallet();
    }, []);

    return (

        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
                    <span className="flex items-center text-brand-500 dark:text-white">
                        <IoMdHome className="h-6 w-6" />
                    </span>
                </div>
            </div>

            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">Wallet Address</p>
                <h4 className="text-md font-bold text-navy-700 dark:text-white">
                    {!connectedAccount ? (
                        <p>Connect wallet</p>
                    ) : (
                        <p className="">
                            {connectedAccount + ""}
                        </p>

                    )}
                </h4>
            </div >
        </Card >
    );
};

export default PoolAmountCard;
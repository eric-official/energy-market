import Card from "components/card";
import React, { useEffect, useState } from "react";
import { isWalletConnected, connectWallet } from "../../../../shared/BasicQuery";
import { useGlobalState } from "../../../../shared/dataStore"
import { BiSolidWallet } from "react-icons/bi";
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";

const { ethereum } = window

const WalletCard = () => {
    const [connectedAccount, setConnectedAccount] = useGlobalState('connectedAccount')
    useEffect(async () => {
        isWalletConnected()
    }, [])
    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
                    <span className="flex items-center text-brand-500 dark:text-white">
                        <BiSolidWallet className="h-6 w-6" />
                    </span>
                </div>
            </div>

            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                {!connectedAccount ? (
                    <button className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90" onClick={connectWallet}>Connect Wallet</button>
                ) : (<div classMonthlyTrafficCardName="flex items-center gap-2">
                    <p className="font-dm text-sm font-medium text-gray-600">Wallet</p>

                    <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold text-navy-700 dark:text-white"></h4>
                        <div className={`rounded-full text-xl`}>
                            <MdCheckCircle className="text-green-500" />
                        </div>
                        <p className="">
                            Connected
                        </p>
                    </div>
                </div>)}

            </div>
        </Card>
    );
};

export default WalletCard;
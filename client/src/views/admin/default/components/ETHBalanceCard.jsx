import Card from "components/card";
import React, { useEffect, useState } from 'react';
import { getBalance } from "../../../../shared/BasicQuery";
import {useGlobalState} from "../../../../shared/dataStore";

const ETHBalanceCard = () => {

    const [balance, setBalance] = useState()
    const [connectedAccount] = useGlobalState('connectedAccount')
    useEffect( () => {
        async function loadBalance() {
            console.log("acc", connectedAccount + "!")
            const balance = await getBalance()
            setBalance(balance)
        }
        loadBalance()
    }, [])

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">Wallet balance: {balance + ""}</p>
            </div>
        </Card>
    );
};

export default ETHBalanceCard;
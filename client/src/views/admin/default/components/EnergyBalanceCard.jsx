import Card from "components/card";
import React, { useEffect, useState } from 'react';
import { getAccountEnergyBalance } from "../../../../shared/ETHQuery";
import {useGlobalState} from "../../../../shared/dataStore";

const EnergyBalanceCard = ({connectedAccount}) => {

    const [balance, setBalance] = useState()
    useEffect( () => {
        async function loadBalance(connectedAccount) {
            const energy_balance = await getAccountEnergyBalance(connectedAccount)
            setBalance(energy_balance)
        }
        loadBalance(connectedAccount)
    }, [connectedAccount])

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">Energy balance: {balance + ""} Kwh</p>
            </div>
        </Card>
    );
};

export default EnergyBalanceCard;
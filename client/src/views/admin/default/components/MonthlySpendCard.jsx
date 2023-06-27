import Card from "components/card";
import React, { useEffect, useState } from 'react';
import { getMonthlySpend } from "../../../../shared/ETHQuery";
import {useGlobalState} from "../../../../shared/dataStore";

const MonthlySpendCard = ({connectedAccount}) => {

    const [spend, setSpend] = useState(0)
    useEffect( () => {
        async function loadMonthlySpend(connectedAccount) {
            const monthly_spend = await getMonthlySpend(connectedAccount)
            setSpend(monthly_spend)
        }
        loadMonthlySpend(connectedAccount)
    }, [connectedAccount])

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">Spend this month : {spend + ""} ETH</p>
            </div>
        </Card>
    );
};

export default MonthlySpendCard;
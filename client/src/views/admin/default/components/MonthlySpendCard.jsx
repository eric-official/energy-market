import Card from "components/card";
import React, { useEffect, useState } from 'react';
import { getMonthlySpend } from "../../../../shared/ETHQuery";
import { useGlobalState } from "../../../../shared/dataStore";
import {IoDocuments} from "react-icons/io5";

const MonthlySpendCard = ({ connectedAccount }) => {

    const [spend, setSpend] = useState(0)
    useEffect(() => {
        async function loadMonthlySpend(connectedAccount) {
            const monthly_spend = await getMonthlySpend(connectedAccount)
            setSpend(monthly_spend)
        }
        loadMonthlySpend(connectedAccount)
    }, [connectedAccount])

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
                    <span className="flex items-center text-brand-500 dark:text-white">
                        <IoDocuments className="h-6 w-6" />
                    </span>
                </div>
            </div>

            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">Balance</p>
                <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    {spend + ""} Kwh
                </h4>
            </div>
        </Card>

    );
};

export default MonthlySpendCard;
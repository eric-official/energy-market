import Card from "components/card";
import React, { useEffect, useState } from 'react';
import { getQueueSum } from "../../../../shared/ETHQuery";

const PoolAmountCard = () => {

    const [queueSum, setQueueSum] = useState()

    useEffect( () => {
        async function loadQueueSum() {
            const queueSum = await getQueueSum()
            setQueueSum(queueSum)
        }
        loadQueueSum()
    }, [])

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">Kwh in the pool: {queueSum + ""}</p>
            </div>
        </Card>
    );
};

export default PoolAmountCard;
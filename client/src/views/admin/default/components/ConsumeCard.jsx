import Card from "components/card";
import React, { useEffect, useState  } from "react";
import { consume, use } from "../../../../shared/ETHQuery";
import { useGlobalState } from "../../../../shared/dataStore"
const { ethereum } = window

const ConsumeCard = ({connectedAccount}) => {

    /*async function startUse(connectedAccount) {
        const timerId = setTimeout(() => {
            use(connectedAccount);
        }, 1000 * 60 * 5);
    }

    const scheduleUse = (connectedAccount) => {
        startUse(connectedAccount).then(() => {
            console.log("schedule done")
        })
    }*/

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <button onClick={() => {
                    consume(connectedAccount);
                    //scheduleUse(connectedAccount);
                }}>
                    Consume 1 kwh
                </button>
            </div>
        </Card>
    );
};

export default ConsumeCard;
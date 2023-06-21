import Card from "components/card";
import React, { useEffect, useState  } from "react";
import { consume } from "../../../../shared/ETHQuery";
import { useGlobalState } from "../../../../shared/dataStore"
const { ethereum } = window

const ConsumeCard = () => {
    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <button onClick={consume}>Consume 1 kwh</button>
            </div>
        </Card>
    );
};

export default ConsumeCard;
import Card from "components/card";
import React, { useEffect, useState  } from "react";
import { use } from "../../../../shared/ETHQuery";
import { useGlobalState } from "../../../../shared/dataStore"
const { ethereum } = window

const UseCard = ({connectedAccount}) => {
    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <button onClick={() => use(connectedAccount)}>Use 1 kwh</button>
            </div>
        </Card>
    );
};

export default UseCard;
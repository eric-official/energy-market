import Card from "components/card";
import React, { useEffect, useState  } from "react";
import { isWalletConnected, connectWallet} from "../../../../shared/BasicQuery";
import { useGlobalState } from "../../../../shared/dataStore"
const { ethereum } = window

const WalletCard = () => {
    const [connectedAccount, setConnectedAccount] = useGlobalState('connectedAccount')
    useEffect(async () => {
        isWalletConnected()
    }, [])
    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                {!connectedAccount ? (
                    <button onClick={connectWallet}>Connect Wallet</button>
                ) : (<p className="font-dm text-sm font-medium text-gray-600">Wallet Connected</p>)}
            </div>
        </Card>
    );
};

export default WalletCard;
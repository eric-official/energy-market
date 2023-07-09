import Card from "components/card";
import React, { useEffect, useState } from "react";
import { isWalletConnected, connectWallet } from "../../../../shared/BasicQuery";
import { useGlobalState } from "../../../../shared/dataStore"
import { BiSolidWallet } from "react-icons/bi";
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

const { ethereum } = window

const Timer = () => {
    const [connectedAccount, setConnectedAccount] = useGlobalState('connectedAccount')
    useEffect(async () => {
        isWalletConnected()
    }, [])
    return (
        <Card extra="!rounded-[20px] p-3">
            <div className="flex flex-row justify-center px-3 pt-2">
                <div>
                    <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                        Timer
                    </h4>
                </div>
            </div>
            <div className="mb-auto flex h-[220px] w-full items-center justify-center">
                <CountdownCircleTimer
                    isPlaying={true}
                    duration={60 * 15}
                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                    colorsTime={[7, 5, 2, 0]}
                    children={(remainingTime) => {
                        const minutes = Math.floor(remainingTime / 60)
                        const seconds = remainingTime % 60
                        return `${minutes}:${seconds}`
                    }}
                    onComplete={() => {
                        // do your stuff here
                        return { shouldRepeat: true }
                    }}
                >
                    {({ remainingTime }) => {
                        const minutes = Math.floor(remainingTime / 60)
                        const seconds = remainingTime % 60
                        return `${minutes}:${seconds}`
                    }}
                </CountdownCircleTimer>
            </div>
        </Card>
    );
};

export default Timer;
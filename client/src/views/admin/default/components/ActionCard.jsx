import Card from "components/card";
import React, { useEffect, useState } from "react";
import { provide, use, consume } from "../../../../shared/ETHQuery";
import Checkbox from "components/checkbox";
import { MdDragIndicator, MdCheckCircle } from "react-icons/md";
const { ethereum } = window

const ActionCard = ({ connectedAccount }) => {
    return (
        <Card extra="!rounded-[20px] p-3">
            <div className="flex flex-row justify-center px-3 pt-2">
                <div>
                    <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                        Perform actions
                    </h4>
                </div>
            </div>
            <div className="h-full w-full">
                <div className="mt-5 flex items-center justify-center p-2">
                    <div className="flex items-center justify-center gap-2">
                        <button className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90" onClick={() => provide(connectedAccount)}>Provide 100 kwh</button>

                    </div>

                </div>

                <div className="mt-2 flex items-center justify-center p-2">
                    <div className="flex items-center justify-center gap-2">
                        <button className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90" onClick={() => consume(connectedAccount)}>Consume 1 kwh</button>

                    </div>

                </div>

                <div className="mt-2 flex items-center justify-center p-2">
                    <div className="flex items-center justify-center gap-2">
                        <button className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90" onClick={() => use(connectedAccount)}>Use 1 kwh</button>

                    </div>

                </div>
            </div>

        </Card>
    );
};

export default ActionCard;
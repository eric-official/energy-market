import Card from "components/card";
import React, { useEffect, useState } from "react";
import { provide, use, consume } from "../../../../shared/ETHQuery";
import Checkbox from "components/checkbox";
import { MdDragIndicator, MdCheckCircle } from "react-icons/md";
import InputField from "components/fields/InputField";
import Switch from "components/switch";

const { ethereum } = window

const ActionCard = ({ connectedAccount }) => {
    const [energyProvide, setEnergyProvide] = useState(''); // State to store the energy input by the user
    const [energyUse, setEnergyUse] = useState('');
    const [max, setMax] = useState('');
    const [min, setMin] = useState('');
    const [isRenewable, setIsRenewable] = useState(false);

    // Function to update the energy state as the user types in the input field
    const handleEnergyProvideChange = (e) => {
        setEnergyProvide(e.target.value);
    };
    const handleEnergyUseChange = (e) => {
        setEnergyUse(e.target.value);
    };

    const handleSwitchChange = (e) => {
        setIsRenewable(e.target.checked);
    };

    const handleMaxChange = (e) => {
        setMax(e.target.value);
    };
    const handleMinChange = (e) => {
        setMin(e.target.value);
    };

    const provideEnergy = async () => {
        // use the 'energy' state here for your logic
        // After your logic, you can clear the input field by setting the energy state back to ''
        await provide(energyProvide, isRenewable, connectedAccount);
        setEnergyProvide('');
    };
    const useEnergy = async () => {
        await use(energyUse, min, max, connectedAccount);
        setEnergyUse('');
        setMax('');
        setMin('');
    };
    return (
        <Card extra="!rounded-[20px] p-3">
            <div className="flex flex-row justify-center px-3 pt-2">
                <div>
                    <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                        Smart Meter Mock
                    </h4>
                </div>
            </div>
            <div className="h-full w-full">
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3" style={{ gridTemplateColumns: '2fr 0.25fr 1fr' }} >
                    <div className="flex items-center justify-center gap-2">
                        <InputField
                            type="text"
                            value={energyProvide}
                            onChange={handleEnergyProvideChange}
                            label="Provide Electricity   (kwh)"
                            className="px-2 py-1 rounded-full-border-2"
                            placeholder="Enter Electricity (kwh)"
                        />
                    </div>
                    <Switch id="switch1" onChange={handleSwitchChange} />
                    <label
                        htmlFor="checkbox1"
                        className="text-base font-medium text-navy-700 dark:text-white"
                    >
                        Renewable source
                    </label>
                    <div className="flex items-center justify-center gap-2">

                        <button className="mt-4 linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90" onClick={provideEnergy}>Provide Electricity</button>
                    </div>
                </div>



                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <InputField
                        type="number"
                        value={energyUse}
                        onChange={handleEnergyUseChange}
                        className="px-2 py-1 rounded-full-border-2"
                        label="Energy (kwh)"
                        placeholder="Enter Energy (kwh)"
                    />
                    <InputField
                        type="number"
                        value={max}
                        onChange={handleMinChange}
                        label="Min-Bid/kwh"
                        className="px-2 py-1 rounded-full-border-2"
                        placeholder="MinBid/kwh"
                    />
                    <InputField
                        type="number"
                        value={min}
                        onChange={handleMaxChange}
                        label="Max-Bid/kwh"
                        className="px-2 py-1 rounded-full-border-2"
                        placeholder="MaxBid/kwh"
                    />
                </div>
                <div className=" flex items-left justify-left p-5">

                    <div className="flex items-center justify-center gap-2">
                        <button className="mt-4 linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90" onClick={useEnergy}>Use Electricity</button>
                    </div>
                </div>
            </div>

        </Card>
    );
};

export default ActionCard;
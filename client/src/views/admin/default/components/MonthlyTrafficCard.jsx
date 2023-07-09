import {
    MdArrowDropUp,
    MdOutlineCalendarToday,
    MdBarChart,
} from "react-icons/md";
import Card from "components/card";

import LineChart from "components/charts/LineChart";
import React, {useEffect, useState} from "react";
import {getBalance} from "../../../../shared/BasicQuery";
import {getMonthlyTrafficData} from "../../../../shared/ETHQuery";

const MonthlyTrafficCard = ({connectedAccount}) => {
    const [energyLabels, setEnergyLabels] = useState([])
    const chartOptionsMonthlyTraffic = {
        legend: {
            show: false,
        },

        theme: {
            mode: "light",
        },
        chart: {
            type: "line",
            height: 350,
            zoom: {
                type: 'x',
                enabled: true,
                autoScaleYaxis: true
            },
            toolbar: {
                autoSelected: 'zoom'
            }
        },

        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "smooth",
        },

        tooltip: {
            style: {
                fontSize: "12px",
                fontFamily: undefined,
                backgroundColor: "#000000"
            },
            theme: 'dark',
            x: {
                format: "YYYY-MM-DDTHH:mm:ss.sssZ",
            },
        },
        grid: {
            show: false,
        },
        xaxis: {
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: "#A3AED0",
                    fontSize: "12px",
                    fontWeight: "500",
                },
            },
            type: "datetime",
            range: undefined,
            categories: energyLabels,
        },

        yaxis: {
            show: true,
        },
    };
    const [energyData, setEnergyData] = useState([])
    const chartDataMonthlyTraffic = [{
        name: "Monthly Traffic",
        data: energyData,
        color: "#6AD2FF",
    },]
    useEffect(() => {
        async function loadData(connectedAccount) {
            if (connectedAccount !== "") {
                const queryResults = await getMonthlyTrafficData(connectedAccount)
                setEnergyData(queryResults["data"])
                setEnergyLabels(queryResults["labels"])
            }
        }

        loadData(connectedAccount)
    }, [connectedAccount])
    return (
        <Card extra="!p-[20px] text-center">
            <div>
                <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                    Your Energy Usage
                </h4>
            </div>
            <div
                className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
                <div className="h-full w-full">
                    {!connectedAccount ? (
                        <p className="mt-10 font-dm text-sm font-medium text-gray-600">
                            Your traffic will be shown after connecting the wallet!
                        </p>
                    ) : (
                        <LineChart
                            options={chartOptionsMonthlyTraffic}
                            series={chartDataMonthlyTraffic}
                        />
                    )}
                </div>
            </div>
        </Card>
    );
};

export default MonthlyTrafficCard;

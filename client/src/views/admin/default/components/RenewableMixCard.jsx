import PieChart from "components/charts/PieChart";
import Card from "components/card";

const PieChartCard = () => {
    const pieChartOptions = {
        labels: ["Renewable Energy", "Non-Renewable Energy"],
        colors: ["#4318FF", "#6AD2FF"],
        chart: {
            width: "50px",
        },
        states: {
            hover: {
                filter: {
                    type: "none",
                },
            },
        },
        legend: {
            show: false,
        },
        dataLabels: {
            enabled: false,
        },
        hover: { mode: null },
        plotOptions: {
            donut: {
                expandOnClick: false,
                donut: {
                    labels: {
                        show: false,
                    },
                },
            },
        },
        fill: {
            colors: ["#4318FF", "#6AD2FF", "#EFF4FB"],
        },
        tooltip: {
            enabled: true,
            theme: "dark",
            style: {
                fontSize: "12px",
                fontFamily: undefined,
                backgroundColor: "#000000"
            },
        },
    };
    return (
        <Card extra="rounded-[20px] p-3">
            <div className="flex flex-row justify-between px-3 pt-2">
                <div>
                    <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                        Current Renewable Energy Mix
                    </h4>
                </div>
            </div>

            <div className="mb-auto flex h-[220px] w-full items-center justify-center">
                <PieChart options={pieChartOptions} series={[68, 32]} />
            </div>
            <div className="flex flex-row !justify-between rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-brand-500" />
                        <p className="ml-1 text-sm font-normal text-gray-600">Renewable Energy</p>
                    </div>
                    <p className="mt-px text-xl font-bold text-navy-700  dark:text-white">
                        63%
                    </p>
                </div>

                <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-[#6AD2FF]" />
                        <p className="ml-1 text-sm font-normal text-gray-600">Non-Renewable Energy</p>
                    </div>
                    <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
                        25%
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default PieChartCard;

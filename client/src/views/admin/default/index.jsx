import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import WalletCard from "./components/WalletCard";
import PoolAmountCard from "./components/PoolAmountCard";
import ProvideCard from "./components/ProvideCard";
import ConsumeCard from "./components/ConsumeCard";
import UseCard from "./components/UseCard";
import EnergyBalanceCard from "./components/EnergyBalanceCard";
import {CountdownCircleTimer} from 'react-countdown-circle-timer'

import ETHBalanceCard from "./components/ETHBalanceCard";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import {IoMdHome} from "react-icons/io";
import {IoDocuments} from "react-icons/io5";
import {MdBarChart, MdDashboard} from "react-icons/md";

import {columnsDataCheck, columnsDataComplex} from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataComplex from "./variables/tableDataComplex.json";
import {useGlobalState} from "../../../shared/dataStore";
import MonthlySpendCard from "./components/MonthlySpendCard";
import MonthlyTrafficCard from "./components/MonthlyTrafficCard";
import RenewableMixCard from "./components/RenewableMixCard";


const Dashboard = () => {
    const [connectedAccount] = useGlobalState('connectedAccount')
    return (
        <div>
            {/* Card widget */}

            <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
                <ETHBalanceCard connectedAccount={connectedAccount}/>
                <EnergyBalanceCard connectedAccount={connectedAccount}/>
                <MonthlySpendCard connectedAccount={connectedAccount}/>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
                <WalletCard/>
                <PoolAmountCard/>
                <ProvideCard connectedAccount={connectedAccount}/>
                <ConsumeCard connectedAccount={connectedAccount}/>
                <UseCard connectedAccount={connectedAccount}/>
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
                        return {shouldRepeat: true}
                    }}
                >
                    {({remainingTime}) => {
                        const minutes = Math.floor(remainingTime / 60)
                        const seconds = remainingTime % 60
                        return `${minutes}:${seconds}`
                    }}
                </CountdownCircleTimer>
                <MonthlyTrafficCard connectedAccount={connectedAccount}/>
                <RenewableMixCard />
                {/*
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Earnings"}
          subtitle={"$340.5"}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6" />}
          title={"Spend this month"}
          subtitle={"$642.39"}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Sales"}
          subtitle={"$574.34"}
        />
        <Widget
          icon={<MdDashboard className="h-6 w-6" />}
          title={"Your Balance"}
          subtitle={"$1,000"}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"New Tasks"}
          subtitle={"145"}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Total Projects"}
          subtitle={"$2433"}
        /> */}
            </div>

            {/* Charts */}
            {/*
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent />
        <WeeklyRevenue />
      </div> */}

            {/* Tables & Charts */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

                {/* Check Table */}
                {/*
        <div>
          <CheckTable
            columnsData={columnsDataCheck}
            tableData={tableDataCheck}
          />
        </div> */}

                {/* Traffic chart & Pie Chart */}
                {/*
        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard />
        </div> */}

                {/* Complex Table , Task & Calendar */}
                {/*
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        /> */}

                {/* Task chart & Calendar */}
                {/*
        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div> */}
            </div>
        </div>
    );
};

export default Dashboard;

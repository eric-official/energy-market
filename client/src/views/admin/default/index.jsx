import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import WalletCard from "./components/WalletCard";
import PoolAmountCard from "./components/PoolAmountCard";
import ProvideCard from "./components/ProvideCard";
import ConsumeCard from "./components/ConsumeCard";
import ActionCard from "./components/ActionCard";
import UseCard from "./components/UseCard";
import EnergyBalanceCard from "./components/EnergyBalanceCard";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import ColumnsTable from "./components/ColumnsTable";
import {
  columnsDataDevelopment,
  columnsDataCheck,
  columnsDataColumns,
  columnsDataComplex,
} from "./variables/columnsData";
import tableDataColumns from "./variables/tableDataColumns.json";

import ETHBalanceCard from "./components/ETHBalanceCard";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import TimerCard from "views/admin/default/components/TimerCard";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard } from "react-icons/md";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataComplex from "./variables/tableDataComplex.json";
import { useGlobalState } from "../../../shared/dataStore";
import MonthlySpendCard from "./components/MonthlySpendCard";
import MonthlyTrafficCard from "./components/MonthlyTrafficCard";
import RenewableMixCard from "./components/RenewableMixCard";


const Dashboard = () => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  return (
    <div>
      {/* Card widget */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-4" style={{ gridTemplateColumns: '1fr 1fr 2fr 1fr' }}>
        <ETHBalanceCard connectedAccount={connectedAccount} />
        <MonthlySpendCard connectedAccount={connectedAccount} />
        <PoolAmountCard connectedAccount={connectedAccount}/>
        <WalletCard />

      </div>

      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-1">
          <RenewableMixCard />
          <TimerCard />
        </div>
        <ColumnsTable
          columnsData={columnsDataColumns}
          tableData={tableDataColumns}
        />
        {/* <MonthlyTrafficCard connectedAccount={connectedAccount} /> */}
        <ActionCard connectedAccount={connectedAccount} />
      </div>




      {/* <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">


        <div>
          <CheckTable
            columnsData={columnsDataCheck}
            tableData={tableDataCheck}
          />
        </div>


        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard />
          <WeeklyRevenue />
        </div>


        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />


        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;

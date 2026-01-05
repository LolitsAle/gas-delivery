"use client";
import BaseBarChart from "@/components/admin/charts/BaseBarChart";
import BaseLineChart from "@/components/admin/charts/BaseLineChart";
import BasePieChart from "@/components/admin/charts/BasePieChart";
import StatCard from "@/components/admin/StatCard";
import {
  SAMPLE_BAR_CHART_DATA,
  SAMPLE_LINE_CHART_DATA,
  SAMPLE_PIE_CHART_DATA,
  SAMPLE_PIE_CHART_DATA_2,
} from "@/constants/SAMPLEDATA";
import { motion } from "framer-motion";
import { DollarSign, User } from "lucide-react";
import React from "react";

function DashboardPage() {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      DASHBOARD
      {/* <main className="max-w-7xl mx-auto py-4 px-4 lg:px-8">
        <motion.div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1}}
        >
          <StatCard name="Đơn Hàng chưa giao" icon={DollarSign} value={1 + " đơn"}></StatCard>
          <StatCard name="Đơn hàng hôm nay" icon={DollarSign} value={20 + " đơn"}></StatCard>
          <StatCard name="Số Đơn nợ" icon={DollarSign} value={5 + " đơn"}></StatCard>
          <StatCard name="Số lượng người dùng" icon={User} value={100 + " user"}></StatCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BaseLineChart chartData={SAMPLE_LINE_CHART_DATA} title="Biểu đồ đường"/>
          <BasePieChart chartData={SAMPLE_PIE_CHART_DATA} title="Biểu đồ tròn" labelStroke={false}/>
          <BasePieChart chartData={SAMPLE_PIE_CHART_DATA_2} title="Biểu đồ tròn" labelStroke={true}/>
          <BaseBarChart chartData={SAMPLE_BAR_CHART_DATA} title="Biểu đồ cột" />
        </div>
      </main>  */}
    </div>
  );
}

export default DashboardPage;

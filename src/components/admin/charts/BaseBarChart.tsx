import { motion } from "framer-motion";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  title: string;
  chartData: any;
  colors?: string[];
}

function BaseBarChart(props: Props) {
  const { title, chartData, colors } = props;

  if (!chartData || chartData.length === 0) return <p>No data available</p>;

  // Extract keys from the first object
  const keys = Object.keys(chartData[0]);
  const xKey = keys[0]; // first key for XAxis
  const barKeys = keys.slice(1); // the rest for Bars

  // Generate fallback colors if not provided
  const defaultColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#00c49f",
    "#ffbb28",
  ];
  const barColors = colors ?? defaultColors;

  return (
    <motion.div
      className="bg-[#1e1e1e] backdrop-blur-md shahow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-base md:text-lg font-medium mb-4 text-gray-100 text-center md:text-left">
        {title}
      </h2>

      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height={"100%"}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis
              dataKey={xKey}
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              width={40}
              interval="preserveStartEnd"
              padding={{ left: 20 }}
            />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2d2d2d",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#f0f0f0",
              }}
              itemStyle={{ color: "#ddd" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            />
            <Legend />
            {barKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={barColors[index % barColors.length]}
                radius={[4, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default BaseBarChart;

"use client";

import { motion } from "framer-motion";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  chartData: any;
  title: string
}

function BaseLineChart(props: Props) {
  const { chartData, title } = props;

  return (
    <motion.div
      className="bg-[#1e1e1e] backdrop-blur-md shahow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{duration: 0.5, delay: 0.2}}
    >
      <h2 className="text-base md:text-lg font-medium mb-4 text-gray-100 text-center md:text-left">
        {title}
      </h2>

      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#4b5563"
            ></CartesianGrid>
            <XAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              width={40}
              dataKey={"name"}
              interval="preserveStartEnd"
              padding={{ left: 20 }} 
            />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4b5563",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ff8000"
              strokeWidth={3}
              dot={{ fill: "black", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default BaseLineChart;

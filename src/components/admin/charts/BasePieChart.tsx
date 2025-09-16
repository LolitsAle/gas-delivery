"use client";

import { generateContrastingColors } from "@/constants/utils";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  chartData: any;
  title: string;
  labelStroke?: object | boolean;
}

function BasePieChart(props: Props) {
  const { chartData, title, labelStroke = false } = props;
  const [isSmallOrMediumScreen, setIsSmallOrMediumScreen] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallOrMediumScreen(window.innerWidth < 760);
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  });

  const outerRadius = isSmallOrMediumScreen ? 60 : 80;

  const colorArray = generateContrastingColors(chartData.length);

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
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <PieChart>
            <Pie
              data={chartData}
              cx={"50%"}
              cy={"50%"}
              labelLine={labelStroke}
              outerRadius={outerRadius}
              dataKey={"value"}
              label={({ name, percent }: any) => {
                if (!percent) return;
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }}
            >
              {chartData.map((entry: { name: string }, index: number) => (
                <Cell
                  key={entry.name + index}
                  fill={colorArray[index % colorArray.length]}
                ></Cell>
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderBlock: "#4b5563",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Legend
              iconType="circle"
              layout="horizontal"
              align="center"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default BasePieChart;

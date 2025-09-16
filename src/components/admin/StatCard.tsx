"use client";
import { motion } from "framer-motion";
import React from "react";

interface Props {
  name: string;
  icon: any;
  value: string | number;
}

function StatCard(props: Props) {
  const { name, icon: Icon, value } = props;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", cursor: "pointer" }}
      className="bg-[#1e1e1e] backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-[#1f1f1f]"
    >
      <div className="px-4 py-5 sm:p-6">
        <span className="flex items-center text-sm font-medium text-gray-300">
          <Icon size={20} className="mr-2"></Icon>
          {name}
        </span>
        <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
      </div>
    </motion.div>
  );
}

export default StatCard;

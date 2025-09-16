"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 500);
          return 100;
        }

        if (old < 90) return old + 5; // chạy nhanh đến 90
        return old + 1; // từ 90 → 100 chậm hơn
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Logo */}
      <motion.img
        src="/icons/icon-180.png"
        alt="App Logo"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-28 h-28 mb-6"
      />

      {/* Slogan */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-2xl font-bold text-orange-300 mb-10 tracking-wide drop-shadow-md"
      >
        Úy Tín - An toàn - Nhanh chóng
      </motion.h1>

      {/* Loading bar */}
      <div className="w-72 h-2 bg-neutral-800 rounded-full overflow-hidden shadow">
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Loading % */}
      <span className="mt-4 text-sm text-gray-300 font-medium">
        {progress}%
      </span>
    </div>
  );
}

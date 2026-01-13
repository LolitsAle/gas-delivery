"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 700);
          return 100;
        }

        if (old < 90) return old + 7;
        return old + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gas-green-500">
      {/* Logo */}
      <motion.img
        src="/images/logo-main.png"
        alt="App Logo"
        className="w-[50vw] mb-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Slogan */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-6 text-center text-sm font-semibold tracking-wide text-gas-gray-50 md:text-2xl drop-shadow"
      >
        Uy tín • An toàn • Nhanh chóng
      </motion.h1>

      {/* Loading bar */}
      <div className="h-2 w-72 overflow-hidden rounded-full bg-white/30 shadow-inner">
        <motion.div
          className="h-full bg-gas-orange-500"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Loading % */}
      <span className="mt-4 text-sm font-medium text-white/80">
        {progress}%
      </span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useInstallPrompt } from "../context/installPromptContext";


export default function InstallPopup() {
  const { deferredPrompt, setDeferredPrompt, isStandalone } = useInstallPrompt();
  const [isOpen, setIsOpen] = useState(true);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("✅ PWA installed");
      } else {
        console.log("❌ User dismissed install");
      }
      setDeferredPrompt(null); // clear after use
    }
  };

  // ✅ Only show if install is possible and not installed
  if (!deferredPrompt || isStandalone || !isOpen) return null;

  return (
    <motion.div
      initial={{ x: 10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-6 right-6 w-72 bg-gray-900 text-white shadow-lg rounded-lg p-4 z-50"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold">Cài ứng dụng</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <p className="text-sm text-gray-300 mt-2">
        📲 Cài ứng dụng để đặt gas nhanh hơn.
      </p>

      <button
        onClick={handleInstall}
        className="mt-3 w-full px-3 py-2 bg-orange-500 text-white text-sm rounded-lg shadow hover:bg-orange-400 cursor-pointer"
      >
        Cài ngay!
      </button>
    </motion.div>
  );
}

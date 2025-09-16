"use client";

import InstallOrOpenButton from "@/components/main/InstallAppButton";
import SplashScreen from "@/components/main/SplashScreen";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }
  return (
    <div>
      <InstallOrOpenButton />
    </div>
  );
}

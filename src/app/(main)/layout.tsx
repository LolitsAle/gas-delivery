"use client";

import { CurrentUserProvider } from "@/components/context/CurrentUserContext";
import BottomNavBar from "@/components/main/BottomNavBar";
import SplashScreen from "@/components/main/SplashScreen";
import { UnsupportedScreen } from "@/components/main/UnsupportedScreen";
import { useUnsupportedScreen } from "@/lib/hooks/useUnsupportedScreen";
import { useState } from "react";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [loading, setLoading] = useState(false);
  const unsupported = useUnsupportedScreen();

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }
  return (
    <>
      {unsupported && <UnsupportedScreen />}
      <CurrentUserProvider>{children}</CurrentUserProvider>
      <BottomNavBar />
    </>
  );
};

export default Layout;

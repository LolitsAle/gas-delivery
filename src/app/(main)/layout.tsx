"use client";

import BottomNavBar from "@/components/main/BottomNavBar";
import { UnsupportedScreen } from "@/components/main/UnsupportedScreen";
import { useUnsupportedScreen } from "@/lib/hooks/useUnsupportedScreen";

export default ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const unsupported = useUnsupportedScreen();
  return (
    <>
      {unsupported && <UnsupportedScreen />}
      {children}
      <BottomNavBar />
    </>
  );
};

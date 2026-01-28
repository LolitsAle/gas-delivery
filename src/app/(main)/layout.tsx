"use client";

import { CurrentUserProvider } from "@/components/context/CurrentUserContext";
import BottomNavBar from "@/components/main/BottomNavBar";
import { UnsupportedScreen } from "@/components/main/UnsupportedScreen";
import { useUnsupportedScreen } from "@/lib/hooks/useUnsupportedScreen";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const unsupported = useUnsupportedScreen();
  return (
    <>
      {unsupported && <UnsupportedScreen />}
      <CurrentUserProvider>{children}</CurrentUserProvider>
      <BottomNavBar />
    </>
  );
};

export default Layout;

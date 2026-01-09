"use client";

import { createContext, useContext, useEffect, useState } from "react";

type InstallPromptContextType = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  triggerInstall: () => Promise<void>;
};

const InstallPromptContext = createContext<InstallPromptContextType | null>(
  null
);

export function InstallPromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detect standalone
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <InstallPromptContext.Provider
      value={{
        deferredPrompt,
        canInstall,
        isStandalone,
        isIOS,
        triggerInstall,
      }}
    >
      {children}
    </InstallPromptContext.Provider>
  );
}

export const useInstallPrompt = () => {
  const ctx = useContext(InstallPromptContext);
  if (!ctx) {
    throw new Error(
      "useInstallPrompt must be used inside InstallPromptProvider"
    );
  }
  return ctx;
};

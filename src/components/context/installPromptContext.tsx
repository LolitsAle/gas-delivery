"use client";
import { createContext, useContext, useEffect, useState } from "react";

type InstallPromptContextType = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  setDeferredPrompt: (e: BeforeInstallPromptEvent | null) => void;
  isStandalone: boolean;
  setIsStandalone: (val: boolean) => void;
};

const InstallPromptContext = createContext<InstallPromptContextType | null>(null);

export function InstallPromptProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone
    ) {
      setIsStandalone(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => setIsStandalone(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <InstallPromptContext.Provider
      value={{ deferredPrompt, setDeferredPrompt, isStandalone, setIsStandalone }}
    >
      {children}
    </InstallPromptContext.Provider>
  );
}

export const useInstallPrompt = () => {
  const ctx = useContext(InstallPromptContext);
  if (!ctx) throw new Error("useInstallPrompt must be used inside InstallPromptProvider");
  return ctx;
};

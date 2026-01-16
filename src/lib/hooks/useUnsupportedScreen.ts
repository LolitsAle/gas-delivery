"use client";

import { useEffect, useState } from "react";

export function useUnsupportedScreen() {
  const [unsupported, setUnsupported] = useState(false);

  const checkScreen = () => {
    const isDesktop = window.innerWidth >= 768;
    const isLandscape = window.innerWidth > window.innerHeight;

    setUnsupported(isDesktop || isLandscape);
  };

  useEffect(() => {
    checkScreen();
    window.addEventListener("resize", checkScreen);
    window.addEventListener("orientationchange", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
      window.removeEventListener("orientationchange", checkScreen);
    };
  }, []);

  return unsupported;
}

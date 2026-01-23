import { InstallPromptProvider } from "@/components/context/installPromptContext";
import { PropsWithChildren } from "react";

export default function layout({ children }: PropsWithChildren) {
  return (
    <>
      <InstallPromptProvider>{children}</InstallPromptProvider>
    </>
  );
}

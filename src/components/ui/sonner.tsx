"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      richColors // ⭐ cho phép màu riêng theo trạng thái
      closeButton // thêm nút X
      toastOptions={{
        duration: 1000, // ⏱️ thời gian đóng ngắn hơn
        className: "text-sm",
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--border-radius": "var(--radius)",

          /* ===== NORMAL ===== */
          "--normal-bg": "hsl(0 99% 99%)",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",

          /* ===== SUCCESS ===== */
          "--success-bg": "hsl(142 76% 36%)",
          "--success-text": "white",
          "--success-border": "hsl(142 76% 30%)",

          /* ===== ERROR ===== */
          "--error-bg": "hsl(0 72% 51%)",
          "--error-text": "white",
          "--error-border": "hsl(0 72% 45%)",

          /* ===== WARNING ===== */
          "--warning-bg": "hsl(38 92% 50%)",
          "--warning-text": "black",
          "--warning-border": "hsl(38 92% 45%)",

          /* ===== INFO ===== */
          "--info-bg": "hsl(221 83% 53%)",
          "--info-text": "white",
          "--info-border": "hsl(221 83% 45%)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

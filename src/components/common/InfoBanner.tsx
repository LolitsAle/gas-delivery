"use client";

import { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info as InfoIcon,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

type InfoType = "warning" | "info" | "error" | "success";

interface InfoProps {
  type?: InfoType;
  title?: string;
  children: ReactNode;
  className?: string;
}

const styles: Record<InfoType, string> = {
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

const icons: Record<InfoType, ReactNode> = {
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <InfoIcon className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  success: <CheckCircle2 className="w-5 h-5" />,
};

export default function InfoBanner({
  type = "info",
  title,
  children,
  className,
}: InfoProps) {
  return (
    <div
      className={clsx(
        "flex gap-3 p-4 rounded-xl border text-sm",
        styles[type],
        className,
      )}
    >
      <div className="mt-0.5">{icons[type]}</div>

      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}

        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

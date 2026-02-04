"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
  trackClassName?: string;
  thumbClassName?: string;
};

function Switch({
  className,
  size = "default",
  trackClassName,
  thumbClassName,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-size={size}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full transition-all outline-none group/switch",
        "data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        trackClassName,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block rounded-full transition-transform",
          "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          thumbClassName,
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

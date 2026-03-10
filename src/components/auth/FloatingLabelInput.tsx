"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

type FloatingLabelInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  rightSlot?: ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
};

export const FloatingLabelInput = forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(function FloatingLabelInput(
  {
    label,
    className,
    wrapperClassName,
    labelClassName,
    rightSlot,
    id,
    disabled,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn("relative mb-3", wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "absolute left-3 -top-2 z-10 bg-white px-1 text-xs font-medium text-gas-green-600",
          labelClassName,
        )}
      >
        {label}
      </label>

      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border bg-white px-4 py-3 transition",
          "focus:outline-none focus:ring-2 focus:ring-gas-green-400",
          rightSlot ? "pr-12" : "",
          disabled ? "bg-gray-50 text-gray-400" : "",
          className,
        )}
        {...props}
      />

      {rightSlot && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {rightSlot}
        </div>
      )}
    </div>
  );
});

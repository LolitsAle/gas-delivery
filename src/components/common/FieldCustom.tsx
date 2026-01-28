"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  id: string;
  as?: "input" | "textarea";
  containerClassName?: string;
  labelClassName?: string;
};

type InputProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type FieldCustomedProps = InputProps | TextareaProps;

const baseInputStyle = `
peer
bg-white
border-gas-gray-300
focus:border-gas-green-600
focus:outline-none
focus:ring-0
focus-visible:ring-0
focus-visible:ring-offset-0
`;

const FieldCustomed = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldCustomedProps
>((props, ref) => {
  const {
    label,
    id,
    as = "input",
    className,
    containerClassName,
    labelClassName,
    ...rest
  } = props;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <div className="relative">
        {as === "textarea" ? (
          <Textarea
            id={id}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={cn(baseInputStyle, "min-h-30 pt-4", className)}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <Input
            id={id}
            ref={ref as React.Ref<HTMLInputElement>}
            className={cn(baseInputStyle, className)}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        <Label
          htmlFor={id}
          className={cn(
            `
            absolute
            left-3
            -top-2
            px-[3vw]
            text-xs
            rounded-sm
            bg-gas-gray-100
            transition-colors
            peer-focus:bg-gas-green-600
            peer-focus:text-white
            `,
            labelClassName,
          )}
        >
          {label}
        </Label>
      </div>
    </div>
  );
});

FieldCustomed.displayName = "FieldCustomed";

export { FieldCustomed };

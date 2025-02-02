import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import { InputType, InputAction, InputSize } from "@/components/Input/V2/types";
import { Typography } from "@/components/Typography";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input text direction in case of no value is typed yet.
   */
  idleDir?: "rtl" | "ltr";
  type?: InputType;
  inputSize?: InputSize;
  icon?: React.ReactNode;
  endAction?: InputAction;
  state?: "error" | "success";
  label?: string;
  helper?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      state,
      label,
      value,
      disabled,
      helper,
      inputSize = "large",
      idleDir = "rtl",
      icon,
      endAction,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "tw-flex tw-flex-col tw-w-full tw-gap-1 tw-group",
          disabled && "tw-cursor-not-allowed"
        )}
      >
        {label ? (
          <Typography
            element="caption"
            weight="semibold"
            htmlFor={props.id}
            className={cn({
              "tw-text-natural-950": !disabled,
              "tw-text-natural-500": disabled,
            })}
          >
            {label}
          </Typography>
        ) : null}
        <div
          data-disabled={disabled}
          className={cn(
            // base
            "tw-w-full tw-px-3",
            "tw-rounded-[6px] tw-border",
            "tw-flex tw-gap-2 tw-items-center tw-bg-natural-50",
            {
              "tw-h-7": inputSize === "small",
              "tw-h-8": inputSize === "medium",
              "tw-h-10": inputSize === "large",
            },
            // Focused
            "focus-within:tw-ring-1 focus-within:tw-ring-brand-700 focus-within:tw-border-brand-700",
            {
              // Default || Filled
              "tw-border-natural-300": !state && !disabled,
              // Error
              "tw-border-destructive-600": state === "error",
              // Success
              "tw-border-brand-600": state === "success",
              // Disabled
              "tw-bg-natural-100 tw-border-natural-200": disabled,
            }
          )}
        >
          {icon ? (
            <div
              className={cn(
                // Default
                "tw-w-4 tw-h-4 tw-cursor-default [&_*]:tw-stroke-natural-600 group-focus-within:[&_*]:tw-stroke-natural-950",
                // Filled
                value && !disabled && "[&_*]:tw-stroke-natural-950",
                // Disabled
                disabled &&
                  "[&_*]:tw-stroke-natural-500 tw-cursor-not-allowed tw-pointer-events-none"
              )}
            >
              {icon}
            </div>
          ) : null}
          <input
            dir={!value ? idleDir : "auto"}
            type={type}
            value={value}
            disabled={disabled}
            className={cn(
              "tw-grow tw-bg-inherit focus-within:tw-outline-none tw-font-medium tw-text-[0.875rem] tw-leading-[150%] tw-h-full",
              // Placeholder
              "placeholder:tw-text-natural-600",
              {
                // Filled
                "tw-text-natural-950": !disabled && value,
                // Disabled
                "tw-text-natural-500 placeholder:tw-text-natural-500 tw-cursor-not-allowed":
                  disabled,
              }
            )}
            ref={ref}
            {...props}
          />
          <Actions disabled={disabled} action={endAction} filled={!!value} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {helper ? (
            <Helper>
              <Typography
                element="tiny-text"
                weight="semibold"
                className={cn("group-focus-within:tw-text-natural-600", {
                  // Default or filled
                  "tw-text-natural-600": !state && !disabled,
                  // Success
                  "tw-text-success-600": state === "success",
                  // Error
                  "tw-text-destructive-600": state === "error",
                  // Disabled
                  "tw-text-natural-500": disabled,
                })}
              >
                {helper}
              </Typography>
            </Helper>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

const framer = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};

export const Helper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <motion.div {...framer} className="tw-flex">
      {children}
    </motion.div>
  );
};

const Actions: React.FC<{
  action: InputAction | undefined;
  disabled?: boolean;
  filled?: boolean;
}> = ({ action, disabled, filled }) => {
  if (!action) return null;
  return (
    <button
      key={action.id}
      onClick={action.onClick}
      type="button"
      className={cn(
        // Default
        "tw-w-4 tw-h-4 [&_*]:tw-stroke-natural-600 group-focus-within:[&_*]:tw-stroke-natural-950",
        "tw-outline-none focus:tw-ring-2 tw-ring-brand-700 tw-rounded-sm",
        // Filled
        filled && !disabled && "[&_*]:tw-stroke-natural-950",
        // Disabled
        disabled &&
          "[&_*]:tw-stroke-natural-500 tw-cursor-not-allowed tw-pointer-events-none",
        action.className
      )}
    >
      <action.Icon />
    </button>
  );
};

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import { InputType, InputAction, InputSize } from "@/components/Input/types";
import { Typography } from "@/components/Typography";

export type ExtraInputProps = {
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
  pre?: React.ReactNode;
  post?: React.ReactNode;
};

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  ExtraInputProps;

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
      pre,
      post,
      ...props
    },
    ref
  ) => {
    const inputInternalRef = useRef<HTMLInputElement | null>(null);

    return (
      <div
        className={cn(
          "flex flex-col w-full gap-1 group",
          disabled && "cursor-not-allowed"
        )}
      >
        {label ? (
          <Typography
            tag="label"
            htmlFor={props.id}
            className={cn("text-caption font-semibold", {
              "text-natural-950": !disabled,
              "text-natural-500": disabled,
            })}
          >
            {label}
          </Typography>
        ) : null}

        <div className="flex flex-row items-center">
          {pre}
          <div
            data-disabled={disabled}
            onClick={() => {
              inputInternalRef.current?.focus();
            }}
            className={cn(
              // base
              "w-full px-3",
              "rounded-[6px] border",
              "flex gap-2 items-center",
              {
                "h-7": inputSize === "small",
                "h-8": inputSize === "medium",
                "h-10": inputSize === "large",
              },
              // Focused
              "[&:has(input:focus)]:ring-1 [&:has(input:focus)]:ring-brand-600 [&:has(input:focus)]:border-brand-600",
              {
                // default or filled
                "border-natural-300 bg-natural-50": !state && !disabled,
                // error
                "border-destructive-600 bg-natural-50": state === "error",
                // success
                "border-success-600 bg-natural-50": state === "success",
                // disabled
                "bg-natural-100 border-natural-200": disabled,
              }
            )}
          >
            {icon ? (
              <div
                className={cn(
                  // Default
                  "w-4 h-4 cursor-default [&_*]:stroke-natural-600 group-focus-within:[&_*]:stroke-natural-950",
                  // Filled
                  value && !disabled && "[&_*]:stroke-natural-950",
                  // Disabled
                  disabled &&
                    "[&_*]:stroke-natural-500 cursor-not-allowed pointer-events-none"
                )}
              >
                {icon}
              </div>
            ) : null}            <input
              dir={!value ? idleDir : "auto"}
              type={type}
              value={value}
              disabled={disabled}
              data-state={state}
              className={cn(
                "grow bg-inherit focus-within:outline-none font-medium text-caption leading-[150%] h-full",
                // placeholder
                "placeholder:text-natural-600 placeholder:font-cairo",
                "placeholder:text-right",
                {
                  // filled
                  "text-natural-950": !disabled && value,
                  // disabled
                  "text-natural-500 placeholder:text-natural-500 cursor-not-allowed":
                    disabled,
                },
                className
              )}
              ref={(input) => {
                if (typeof ref === "function") ref(input);
                inputInternalRef.current = input;
              }}
              {...props}
            />
            <Action disabled={disabled} action={endAction} filled={!!value} />
          </div>
          {post}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {helper ? (
            <Helper>
              <Typography
                tag="span"
                className={cn("text-tiny font-semibold", {
                  // Default or filled
                  "text-natural-600 group-focus-within:text-natural-600":
                    !state && !disabled,
                  // Success
                  "text-success-600": state === "success",
                  // Error
                  "text-destructive-600": state === "error",
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
    <motion.div {...framer} className="flex">
      {children}
    </motion.div>
  );
};

const Action: React.FC<{
  action: InputAction | undefined;
  disabled?: boolean;
  filled?: boolean;
}> = ({ action, disabled, filled }) => {
  if (!action) return null;
  return (
    <button
      key={action.id}
      onClick={action.onClick}
      disabled={disabled}
      type="button"
      className={cn(
        // Default
        "flex items-center justify-center",
        "w-5 h-5 -mx-1 [&_*]:stroke-natural-600 group-focus-within:[&_*]:stroke-natural-950",
        "outline-none focus:ring-2 ring-brand-700 rounded-sm",
        // Filled
        filled && !disabled && "[&_*]:stroke-natural-950",
        // Disabled
        disabled &&
          "[&_*]:stroke-natural-500 cursor-not-allowed pointer-events-none",
        action.className
      )}
    >
      {action.icon}
    </button>
  );
};

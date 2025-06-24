import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import { Typography } from "@/components/Typography";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Textarea text direction in case of no value is typed yet.
   */
  idleDir?: "rtl" | "ltr";
  state?: "error" | "success";
  label?: string;
  helper?: string | null;
  maxAllowedCharacters?: number;
  endActions?: {
    id: number;
    icon: React.ReactNode;
    onClick?: () => void;
    className?: string;
  };
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      state,
      label,
      value,
      disabled,
      helper,
      maxAllowedCharacters,
      endActions,
      idleDir = "rtl",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "flex flex-col w-full gap-1 font-cairo group",
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
        <div
          data-disabled={disabled}
          className={cn(
            // base
            "w-full pb-[6px] overflow-hidden",
            "rounded-md border",
            "flex flex-col gap-1 bg-natural-50",
            // focused
            "focus-within:ring-2 focus-within:ring-brand-600 focus-within:border-transparent",
            {
              // default or filled
              "border-natural-300": !state && !disabled,
              // error
              "border-destructive-600": state === "error",
              // success
              "border-brand-600": state === "success",
              // disabled
              "bg-natural-100 border-natural-200": disabled,
            }
          )}
        >
          <div
            className={cn(
              "pt-3 px-3 grow bg-inherit w-full flex resize-none focus-within:outline-none font-medium text-caption h-full"
            )}
          >
            <textarea
              dir={!value ? idleDir : "auto"}
              value={value}
              disabled={disabled}
              className={cn(
                "grow bg-inherit w-full resize-none focus-within:outline-none font-medium text-caption h-full",
                "scrollbar-thin scrollbar-thumb-natural-200 scrollbar-track-natural-50 rounded-md",
                // Placeholder
                "placeholder:text-natural-600",
                {
                  // Filled
                  "text-natural-950": !disabled && value,
                  // Disabled
                  "text-natural-500 placeholder:text-natural-500 cursor-not-allowed":
                    disabled,
                },
                className
              )}
              ref={ref}
              {...props}
            />
            <Action action={endActions} disabled={disabled} filled={!!value} />
          </div>
          {maxAllowedCharacters ? (
            <div dir="ltr" className="flex flex-col gap-1 px-3">
              <hr
                className={cn("group-focus-within:border-secondary-700", {
                  "border-natural-200": disabled,
                  "border-natural-300": !state,
                  "border-success-600": state === "success",
                  "border-destructive-600": state === "error",
                })}
              />
              <div className="w-fit">
                <Typography
                  tag="span"
                  className={cn(
                    "justify-self-end group-focus-within:text-natural-950 text-tiny",
                    {
                      "text-natural-600": !value && !disabled && !state,
                      "text-natural-950": value && !disabled && !state,
                      "text-natural-500": disabled,
                      "text-destructive-600": state === "error",
                    }
                  )}
                >
                  {value?.toString().length || 0} / {maxAllowedCharacters}
                </Typography>
              </div>
            </div>
          ) : null}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {helper ? (
            <Helper>
              <Typography
                tag="span"
                className={cn("text-tiny font-semibold", {
                  // default or filled
                  "text-natural-600": !state && !disabled,
                  // success
                  "text-success-600": state === "success",
                  // error
                  "text-destructive-600": state === "error",
                  // disabled
                  "text-natural-500": disabled,
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
    <motion.span {...framer} className="flex">
      {children}
    </motion.span>
  );
};

const Action: React.FC<{
  action: TextareaProps["endActions"] | undefined;
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

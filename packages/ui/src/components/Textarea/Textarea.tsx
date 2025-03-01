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
            "rounded-[6px] border",
            "flex flex-col gap-1 bg-natural-50",
            // Focused
            "focus-within:ring-1 focus-within:ring-brand-700 focus-within:border-brand-700",
            {
              // Default || Filled
              "border-natural-300": !state && !disabled,
              // Error
              "border-destructive-600": state === "error",
              // Success
              "border-brand-600": state === "success",
              // Disabled
              "bg-natural-100 border-natural-200": disabled,
            }
          )}
        >
          <textarea
            dir={!value ? idleDir : "auto"}
            value={value}
            disabled={disabled}
            className={cn(
              "pt-3 grow bg-inherit w-full resize-none focus-within:outline-none font-medium text-[0.875rem] leading-[150%] h-full px-3",
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
          {maxAllowedCharacters ? (
            <div dir="ltr" className="flex flex-col gap-1 px-3">
              <hr
                className={cn("group-focus-within:border-brand-700", {
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
                className={cn(
                  "group-focus-within:text-natural-600 text-tiny font-semibold",
                  {
                    // Default || Filled
                    "text-natural-600": !state && !disabled,
                    // Success
                    "text-success-600": state === "success",
                    // Error
                    "text-destructive-600": state === "error",
                    // Disabled
                    "text-natural-500": disabled,
                  }
                )}
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

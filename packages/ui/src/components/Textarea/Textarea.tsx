import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import { Tooltip } from "@/components/Tooltip";
import { useFormatMessage } from "@/hooks";

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
    const intl = useFormatMessage();
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
            "tw-w-full tw-px-3 tw-py-[6px]",
            "tw-rounded-[6px] tw-border",
            "tw-flex tw-flex-col tw-gap-1 tw-bg-natural-50",
            // Focused
            "focus-within:tw-border-brand-700 focus-within:tw-border-2",
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
          <textarea
            dir={!value ? idleDir : "auto"}
            value={value}
            disabled={disabled}
            className={cn(
              "tw-grow tw-bg-inherit tw-w-full tw-resize-none focus-within:tw-outline-none tw-font-medium",
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
          {maxAllowedCharacters ? (
            <div dir="ltr" className="tw-flex tw-flex-col tw-gap-1">
              <hr
                className={cn("group-focus-within:tw-border-brand-700", {
                  "tw-border-natural-200": disabled,
                  "tw-border-natural-300": !state,
                  "tw-border-success-600": state === "success",
                  "tw-border-destructive-600": state === "error",
                })}
              />
              <Tooltip
                show={!!value && value.toString().length > maxAllowedCharacters}
                side="right"
                content={
                  <Typography
                    element="body"
                    className="tw-text-natural-950 tw-max-w-[296px]"
                  >
                    {intl("text-area.validate.maxAllowed")}
                  </Typography>
                }
              >
                <div className="tw-w-fit">
                  <Typography
                    element="tiny-text"
                    className={cn(
                      "tw-justify-self-end group-focus-within:tw-text-natural-950",
                      {
                        "tw-text-natural-600": !value && !disabled,
                        "tw-text-natural-950": value && !disabled,
                        "tw-text-natural-500": disabled,
                      }
                    )}
                  >
                    <Typography
                      element="tiny-text"
                      className={cn("tw-justify-self-end", {
                        "tw-text-natural-500": disabled,
                        "tw-text-destructive-600":
                          state === "error" ||
                          (value &&
                            value.toString().length > maxAllowedCharacters),
                      })}
                    >
                      {value?.toString().length || 0}{" "}
                    </Typography>
                    /{maxAllowedCharacters}
                  </Typography>
                </div>
              </Tooltip>
            </div>
          ) : null}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {helper ? (
            <Helper>
              <Typography
                element="tiny-text"
                weight="semibold"
                className={cn("group-focus-within:tw-text-natural-600", {
                  // Default || Filled
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
  return <motion.div {...framer}>{children}</motion.div>;
};

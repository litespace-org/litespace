import React from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import { AnimatePresence } from "framer-motion";
import { Helper } from "@/components/Input/Input";

export interface TextareaProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  helper?: string;
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, name, value, placeholder, helper, className, ...props }, ref) => {
    return (
      <div className="tw-flex tw-flex-col tw-gap-1">
        <textarea
          ref={ref}
          name={name}
          disabled={props.disabled}
          data-error={!!error}
          value={value}
          placeholder={placeholder}
          className={cn(
            //base
            "tw-w-full tw-h-full tw-resize-none tw-bg-natural-50 tw-font-cairo",
            "tw-border tw-border-natural-300 tw-p-[14px] tw-rounded-lg",
            "tw-text-natural-900 tw-text-base tw-transition-all tw-duration-200",
            // hover
            "hover:tw-bg-brand-50 hover:tw-border-brand-200",
            // active/focus
            "focus-within:tw-border-brand-500 focus-within:hover:tw-border-brand-500 focus-within:tw-shadow-input-focus focus:tw-outline-none",
            //placeholder
            "placeholder:tw-text-natural-400",
            // error
            "data-[error=true]:tw-shadow-input-error data-[error=true]:tw-border-destructive-600 data-[error=true]:hover:tw-bg-natural-50 data-[error=true]:hover:tw-border-destructive-600",
            // disabled
            "disabled:tw-opacity-50",
            className
          )}
          {...props}
        />

        <AnimatePresence mode="wait" initial={false}>
          {helper ? (
            <Helper>
              <Typography
                element="tiny-text"
                className={cn(
                  error ? "tw-text-destructive-500" : "tw-text-natural-400"
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

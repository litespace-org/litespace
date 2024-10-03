import React from "react";
import { AnimatePresence } from "framer-motion";
import cn from "classnames";
import { InputError } from "@/components/Input/Input";

export interface TextareaProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, name, className, ...props }, ref) => {
    return (
      <div className="tw-flex tw-flex-col tw-w-full">
        <div
          className={cn(
            "tw-w-full tw-relative tw-grid",
            'after:tw-content-[attr(TEST)_"_"] after:tw-whitespace-pre-wrap after:tw-invisible'
          )}
          style={{
            gridArea: "1 / 1 / 2 / 2",
          }}
        >
          <textarea
            className={cn(
              "tw-font-cairo tw-block tw-box-border tw-w-full tw-rounded-md tw-shadow-sm tw-transition-all",
              "tw-text-foreground focus-visible:tw-shadow-md tw-outline-none",
              "focus:tw-ring-current focus:tw-ring-2 focus-visible:tw-border-foreground-muted",
              "focus-visible:tw-ring-background-control tw-placeholder-foreground-muted group",
              "tw-border tw-border-control tw-text-sm tw-px-4 tw-py-4",
              "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
              {
                "tw-bg-foreground/[.026]": !error,
                "tw-bg-destructive-200 tw-border tw-border-destructive-400 focus:tw-ring-destructive-400 placeholder:tw-text-destructive-400":
                  !!error,
              },
              "tw-resize-none tw-overflow-hidden",
              className
            )}
            name={name}
            ref={ref}
            dir="auto"
            style={{
              gridArea: "1 / 1 / 2 / 2",
            }}
            {...props}
          />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {error ? <InputError message={error} key={name} /> : null}
        </AnimatePresence>
      </div>
    );
  }
);

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import { InputType, InputAction } from "@/components/Input/types";
import { Typography } from "@/components/Typography";

const passwordPlaceholder = "••••••••";

// auto resize text input, used for chat box
// https://www.youtube.com/watch?v=sOnPz_GMa38

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input text direction incase of no value is typed yet.
   */
  defaultDir?: "rlt" | "ltr";
  type?: InputType;
  starActions?: Array<InputAction>;
  endActions?: Array<InputAction>;
  error?: boolean;
  helper?: string | null;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      error,
      value,
      disabled,
      helper,
      placeholder,
      defaultDir = "rlt",
      starActions = [],
      endActions = [],
      ...props
    },
    ref
  ) => {
    return (
      <div className="tw-flex tw-flex-col tw-w-full">
        <div
          data-filled={!!value}
          data-error={!!error}
          data-disabled={disabled}
          className={cn(
            // base
            "tw-w-full tw-transition-colors tw-duration-200",
            "tw-flex tw-flex-row tw-items-center tw-gap-2",
            // default
            " tw-bg-natural-50 tw-border tw-border-natural-300 tw-rounded-lg tw-px-[0.875rem]",
            // hover
            "hover:tw-bg-brand-50 hover:tw-border-brand-200",
            // active/focus
            "focus-within:tw-border-brand-500 focus-within:tw-shadow-input-focus",
            // error
            "data-[error=true]:tw-shadow-input-error data-[error=true]:tw-border-destructive-600 data-[error=true]:hover:tw-bg-natural-50 data-[error=true]:hover:tw-border-destructive-600",
            // disabled
            "data-[disabled=true]:tw-opacity-50"
          )}
        >
          <Actions actions={starActions} />
          <input
            dir={!value ? defaultDir : "auto"}
            type={type}
            value={value}
            disabled={disabled}
            className={cn(
              "tw-w-full tw-text-right focus:tw-text-start tw-bg-transparent focus:tw-outline-none",
              "placeholder:tw-font-normal placeholder:tw-text-natural-400 placeholder:tw-text-base placeholder:tw-leading-6",
              "tw-text-natural-900 dark:tw-text-foreground tw-leading-6 tw-py-4"
            )}
            placeholder={
              type === InputType.Password
                ? placeholder || passwordPlaceholder
                : placeholder
            }
            ref={ref}
            {...props}
          />
          <Actions actions={endActions} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {helper ? (
            <Helper>
              <Typography
                element="tiny-text"
                weight="regular"
                className={cn(
                  "tw-mt-1",
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

const Actions: React.FC<{
  actions: InputAction[];
}> = ({ actions }) => {
  return (
    <>
      {actions.map(({ id, Icon, onClick }) => (
        <button key={id} onClick={onClick} type="button">
          <Icon />
        </button>
      ))}
    </>
  );
};

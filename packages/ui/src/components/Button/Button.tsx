import React, { useMemo } from "react";
import cn from "classnames";
import {
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@/components/Button/types";
import { Spinner } from "@/icons/Spinner";

type Button = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: Button["onClick"];
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  htmlType?: Button["type"];
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}> = ({
  children,
  variant = "primary",
  type = "main",
  size = "small",
  onClick,
  disabled,
  className,
  htmlType,
  loading,
  startIcon,
  endIcon,
}) => {
  const is = useMemo(
    () => ({
      primary: variant === "primary",
      secondary: variant === "secondary",
      tertiary: variant === "tertiary",

      main: type === "main",
      warning: type === "warning",
      error: type === "error",
      success: type === "success",

      small: size === "small",
      medium: size === "medium",
      large: size === "large",
    }),
    [variant, type, size]
  );

  return (
    <button
      type={htmlType}
      disabled={disabled}
      data-size={size}
      data-type={type}
      className={cn(
        // general styles
        "tw-relative tw-font-cairo tw-cursor-pointer tw-font-medium",
        "tw-text-center tw-font-normal tw-transition-colors tw-ease-out tw-duration-200 tw-rounded-lg",
        "tw-outline-none tw-transition-all tw-outline-0",
        "tw-w-fit tw-flex tw-items-center tw-justify-center tw-text-base",
        "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
        "tw-flex tw-items-center",
        // bg color
        {
          "hover:tw-bg-natural-100 active:tw-bg-natural-200": is.tertiary,
          "tw-bg-brand-700 hover:tw-bg-brand-600": is.primary && is.main,
          "tw-bg-destructive-700 hover:tw-bg-destructive-600":
            is.primary && is.error,
          "tw-bg-success-700 hover:tw-bg-success-600": is.primary && is.success,

          "tw-bg-natural-50 focus:tw-bg-natural-50": is.secondary,
          "hover:tw-bg-brand-50 active:tw-bg-brand-100":
            is.secondary && is.main,
          "hover:tw-bg-destructive-50 active:tw-bg-destructive-100":
            is.secondary && is.error,
          "hover:tw-bg-success-50 active:tw-bg-success-100":
            is.secondary && is.success,
        },
        // text color
        {
          "tw-text-natural-50": is.primary,
          "tw-text-natural-700": is.tertiary,
          "tw-text-brand-700": is.secondary && is.main,
          "tw-text-destructive-700 focus:tw-text-destructive-500":
            is.secondary && is.error,
          "tw-text-success-700 focus:tw-text-success-500":
            is.secondary && is.success,
        },
        // font weight and size
        {
          "tw-font-medium tw-leading-[150%]": true,
          "tw-text-[0.875rem]": is.small,
          "tw-text-[1rem]": is.medium || is.large,
        },
        // dimentions, margins, and paddings
        {
          "tw-px-2 tw-h-[28px]": is.small,
          "tw-px-3 tw-h-8": is.medium,
          "tw-px-4 tw-h-10": is.large,
        },
        // border
        {
          "focus:tw-ring-[1.5px] focus:tw-ring-secondary-600":
            !loading && !disabled,
          "tw-ring-[1px]": is.secondary,
          "tw-ring-brand-700": is.secondary && is.main,

          "tw-ring-destructive-700": is.secondary && is.error,
          "hover:tw-ring-destructive-500": is.secondary && is.error,
          "active:tw-ring-destructive-500": is.secondary && is.error,

          "tw-ring-success-700": is.secondary && is.success,
          "hover:tw-ring-success-500": is.secondary && is.success,
          "active:tw-ring-success-500": is.secondary && is.success,
        },
        className
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          loading
            ? "tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2"
            : "tw-hidden"
        )}
      >
        <Spinner
          className={cn({
            "tw-text-natural-50": is.primary,

            "tw-text-success-700 dark:tw-text-success-400":
              is.secondary && is.success,
            "tw-text-destructive-700 dark:tw-text-destructive-300":
              is.secondary && is.error,
            "tw-text-brand-700 dark:tw-text-brand-50": is.secondary && is.main,
            "tw-text-warning-700 dark:tw-text-warning-300":
              is.secondary && is.warning,

            "tw-text-brand-700 dark:tw-text-brand-200": is.tertiary && is.main,
            "tw-text-warning-700 dark:tw-text-warning-200":
              is.tertiary && is.warning,
            "tw-text-destructive-700 dark:tw-text-destructive-200":
              is.tertiary && is.error,
            "tw-text-success-700 dark:tw-text-success-200":
              is.tertiary && is.success,

            "tw-w-[20px] tw-h-[20px]": is.small,
          })}
        />
      </span>

      <div
        className={cn(
          loading ? "tw-opacity-0" : "tw-opacity-100",
          "tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-2"
        )}
      >
        {startIcon ? <div className="tw-w-4 tw-h-4">{startIcon}</div> : null}
        {children}
        {endIcon ? <div className="tw-w-4 tw-h-4">{endIcon}</div> : null}
      </div>
    </button>
  );
};

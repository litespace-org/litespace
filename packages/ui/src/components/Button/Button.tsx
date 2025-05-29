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
  children?: React.ReactNode;
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
  tabIndex?: number;
  autoFocus?: boolean;
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
  tabIndex,
  autoFocus,
}) => {
  const is = useMemo(
    () => ({
      primary: variant === "primary",
      secondary: variant === "secondary",

      main: type === "main",
      warning: type === "warning",
      error: type === "error",
      success: type === "success",
      natural: type === "natural",

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
      data-variant={variant}
      tabIndex={tabIndex}
      className={cn(
        // Teneral styles
        "text-center font-normal group",
        "flex items-center justify-center",
        "relative font-cairo cursor-pointer",
        "w-fit flex items-center justify-center",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors ease-out duration-200 rounded-lg outline-none",
        // Background color
        {
          "bg-destructive-700 hover:bg-destructive-600 active:bg-destructive-700":
            is.error && is.primary,
          "bg-natural-50 hover:bg-destructive-50 active:bg-destructive-100":
            is.error && is.secondary,

          "bg-brand-500 hover:bg-brand-400 active:bg-brand-500":
            is.main && is.primary,
          "bg-natural-50 hover:bg-brand-50 active:bg-brand-100":
            is.main && is.secondary,

          "bg-success-700 hover:bg-success-600 active:bg-success-700":
            is.success && is.primary,
          "bg-natural-50 hover:bg-success-50 active:bg-success-100":
            is.success && is.secondary,

          "bg-warning-700 hover:bg-warning-600 active:bg-warning-700":
            is.warning && is.primary,
          "bg-natural-50 hover:bg-warning-50 active:bg-warning-100":
            is.warning && is.secondary,

          "bg-natural-100 hover:bg-natural-200 active:bg-natural-300 focus-visible:bg-natural-100 disabled:bg-natural-200":
            is.natural && is.primary,
          "bg-natural-50 hover:bg-natural-100 active:bg-natural-200":
            is.natural && is.secondary,
        },
        // Text color
        {
          "text-natural-700": is.natural,
          "text-natural-50": is.primary && !is.natural,
          "text-brand-500": is.secondary && is.main,
          "text-destructive-700 hover:text-destructive-500":
            is.secondary && is.error,
          "text-success-700 hover:text-success-500": is.secondary && is.success,
          "text-warning-700": is.warning && is.secondary,
        },
        // Font
        {
          "font-medium leading-[150%]": true,
          "text-[0.875rem]": is.small,
          "text-[1rem]": is.medium || is.large,
        },
        // Spacing
        {
          "px-2 h-7": is.small,
          "px-3 h-8": is.medium,
          "px-4 h-10": is.large,
        },
        // Border & Focus
        // TODO: add `primary` variant borders.
        "border focus-visible:outline-[2px] focus-visible:outline-brand-500",
        {
          //==================== TEMP ====================
          "border-default-brand active:border-active-brand":
            is.main && is.primary,
          "border-destructive-700 ": is.error && is.primary,
          "border-success-500 ": is.success && is.primary,
          "border-warning-700 ": is.warning && is.primary,
          "border-default-natural active:border-active-natural":
            is.natural && is.primary,
          //==================== END ====================
          "border-brand-500": is.main && is.secondary,
          "border-destructive-700": is.error && is.secondary,
          "border-success-500": is.success && is.secondary,
          "border-warning-700": is.warning && is.secondary,
          "border-natural-100 active:border-natural-200 disabled:border-natural-200":
            is.natural && is.secondary,
        },
        className
      )}
      onClick={onClick}
      autoFocus={autoFocus}
    >
      <span
        className={cn(
          loading
            ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "hidden"
        )}
      >
        <Spinner
          className={cn({
            "text-natural-50": is.primary,
            "text-success-700": is.secondary && is.success,
            "text-destructive-700": is.secondary && is.error,
            "text-brand-700": is.secondary && is.main,
            "text-warning-700": is.secondary && is.warning,
            "w-5 h-5": is.small,
          })}
        />
      </span>

      <div
        className={cn(
          loading ? "opacity-0" : "opacity-100",
          "flex flex-row items-center justify-center gap-2",
          {
            "[&_.icon>*]:stroke-success-700 group-hover:[&_.icon>*]:stroke-success-500 [&_.icon>*]:transition-[stroke] [&_.icon>*]:duration-200 [&_.text]:text-success-700 group-hover:[&_.text]:text-success-500 [&_.text]:transition-colors":
              is.success && is.secondary,
            "[&_.icon>*]:stroke-natural-50":
              (is.main && is.primary) || (is.error && is.primary),
            "[&_.icon>*]:stroke-brand-700": is.main && is.secondary,
            "[&_.icon>*]:stroke-destructive-700 group-hover:[&_.icon>*]:stroke-destructive-500 [&_.icon>*]:transition-[stroke] [&_.icon>*]:duration-200 [&_.text]:text-destructive-700 group-hover:[&_.text]:text-destructive-500 [&_.text]:transition-colors":
              is.error && is.secondary,
            "[&_.icon>*]:stroke-natural-700 [&_.text]:text-natural-700":
              is.natural,
          }
        )}
      >
        {startIcon ? <div className="w-4 h-4">{startIcon}</div> : null}
        {children}
        {endIcon ? <div className="w-4 h-4">{endIcon}</div> : null}
      </div>
    </button>
  );
};

import React from "react";
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
  onClick?: React.DOMAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  variant?: string;
  className?: string;
  htmlType?: HTMLButtonElement["type"];
  loading?: boolean;
}> = ({
  children,
  variant = ButtonVariant.Primary,
  type = ButtonType.Main,
  size = ButtonSize.Small,
  onClick,
  disabled,
  className,
  htmlType,
  loading,
}) => {
  return (
    <button
      type={htmlType}
      disabled={disabled}
      data-size={size}
      data-type={type}
      className={cn(
        "tw-relative tw-font-cairo tw-cursor-pointer tw-font-medium",
        "tw-text-center tw-font-normal tw-transition-colors tw-ease-out tw-duration-200 tw-rounded-lg",
        "tw-outline-none tw-transition-all tw-outline-0",
        "tw-w-fit tw-flex tw-items-center tw-justify-center tw-text-base",
        "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
        "tw-flex tw-items-center",
        {
          "tw-text-natural-50 tw-bg-brand-700 hover:tw-bg-brand-800 focus:tw-bg-brand-900 focus:tw-ring-1 focus:tw-ring-brand-200 dark:tw-bg-brand-400 dark:tw-text-secondary-900 dark:hover:tw-bg-brand-500 dark:focus:tw-bg-brand-700 dark:focus:tw-text-natural-50 dark:focus:tw-ring-brand-100":
            type === ButtonType.Main && variant === ButtonVariant.Primary,
          "tw-border tw-text-brand-700 tw-border-brand-700 hover:tw-bg-brand-100 focus:tw-bg-brand-200 focus:tw-ring-1 focus:tw-ring-brand-700 dark:tw-border-brand-50 dark:tw-text-brand-50 dark:hover:tw-bg-brand-100 dark:hover:tw-border-brand-700 dark:hover:tw-text-brand-700 dark:focus:tw-bg-brand-200 dark:focus:tw-ring-brand-700 dark:focus:tw-text-brand-700":
            type === ButtonType.Main && variant === ButtonVariant.Secondary,
          "tw-border-b tw-rounded-none tw-text-brand-700 tw-border-transparent hover:tw-border-brand-700 focus:tw-border-brand-800 focus:tw-text-brand-800 dark:tw-text-brand-200 dark:tw-border-transparent dark:hover:tw-border-brand-200 dark:focus:tw-border-brand-400 dark:focus:tw-text-brand-400":
            type === ButtonType.Main && variant === ButtonVariant.Tertiary,

          "tw-text-natural-50 tw-bg-success-700 hover:tw-bg-success-800 focus:tw-bg-success-900 focus:tw-ring-1 focus:tw-ring-success-200":
            type === ButtonType.Success && variant === ButtonVariant.Primary,
          "tw-text-success-700 tw-border tw-border-brand-700 hover:tw-bg-brand-100 hover:tw-border-brand-700 focus:tw-bg-brand-200 focus:tw-ring-1 focus:tw-ring-brand-900 dark:tw-border-success-400 dark:tw-text-success-400 dark:hover:tw-bg-success-100 dark:hover:tw-border-success-800 dark:hover:tw-text-success-800 dark:focus:tw-bg-success-300 dark:focus:tw-border-success-300 dark:focus:tw-text-success-900":
            type === ButtonType.Success && variant === ButtonVariant.Secondary,
          "tw-text-success-700 tw-border-b tw-rounded-none tw-border-transparent hover:tw-border-brand-700 focus:tw-border-brand-800 focus:tw-text-brand-800 dark:tw-border-transparent dark:tw-text-success-200 dark:hover:tw-border-success-200 dark:focus:tw-border-success-400 dark:focus:tw-text-success-400":
            type === ButtonType.Success && variant === ButtonVariant.Tertiary,

          "tw-text-natural-50 tw-bg-warning-700 hover:tw-bg-warning-800 focus:tw-bg-warning-900 focus:tw-ring-1 focus:tw-ring-warning-200":
            type === ButtonType.Warning && variant === ButtonVariant.Primary,
          "tw-text-warning-700 tw-border tw-border-warning-700 hover:tw-border-warning-700 hover:tw-bg-warning-100 focus:tw-bg-warning-200 focus:tw-ring-1 focus:tw-ring-warning-900 dark:tw-border-warning-300 dark:tw-text-warning-300 dark:hover:tw-bg-warning-200 dark:hover:tw-border-warning-800 dark:hover:tw-text-warning-800 dark:focus-visible:tw-bg-warning-300 dark:focus-visible:tw-border-warning-900 dark:focus-visible:tw-text-warning-900":
            type === ButtonType.Warning && variant === ButtonVariant.Secondary,
          "tw-text-warning-700 tw-border-b tw-rounded-none tw-border-transparent hover:tw-border-warning-700 focus:tw-border-warning-800 focus:tw-text-warning-800 dark:tw-border-transparent dark:tw-text-warning-200 dark:hover:tw-border-warning-200 dark:focus-visible:tw-border-warning-400 dark:focus-visible:tw-text-warning-400":
            type === ButtonType.Warning && variant === ButtonVariant.Tertiary,

          "tw-text-natural-50 tw-bg-destructive-700 tw-border tw-border-destructive-700 hover:tw-bg-destructive-800 hover:tw-border-destructive-800 focus:tw-bg-destructive-900 focus:tw-ring-1 focus:tw-ring-error-200 dark:tw-bg-destructive-400 dark:hover:tw-bg-destructive-600 dark:focus-visible:tw-bg-destructive-700 dark:focus-visible:tw-border-destructive-200":
            type === ButtonType.Error && variant === ButtonVariant.Primary,
          "tw-text-destructive-700 tw-border tw-border-destructive-700 hover:tw-bg-destructive-100 hover:tw-border-destructive-300 focus:tw-ring-1 focus:tw-ring-destructive-900 focus:tw-bg-destructive-200 dark:tw-border-destructive-300 dark:tw-text-destructive-300 dark:hover:tw-bg-destructive-200 dark:hover:tw-border-destructive-300 dark:hover:tw-text-destructive-800 dark:focus:tw-bg-destructive-300 dark:focus:tw-ring-destructive-900 dark:focus:tw-text-destructive-900":
            type === ButtonType.Error && variant === ButtonVariant.Secondary,
          "tw-text-destructive-700 tw-border-b tw-rounded-none tw-border-transparent hover:tw-border-destructive-700 focus:tw-border-destructive-800 focus:tw-text-destructive-800 dark:tw-border-transparent dark:tw-text-destructive-200 dark:hover:tw-border-destructive-200 dark:hover:tw-text-destructive-200 dark:focus:tw-text-destructive-400 dark:focus:tw-border-destructive-400":
            type === ButtonType.Error && variant === ButtonVariant.Tertiary,

          "tw-text-sm tw-px-4 tw-py-2 tw-h-[2.5rem]": size === ButtonSize.Tiny,
          "tw-text-base tw-leading-4 tw-px-6 tw-py-3 tw-h-[3rem]":
            size === ButtonSize.Small,
          "tw-text-base tw-px-8 tw-py-4 tw-font-bold tw-h-[3.5rem]":
            size === ButtonSize.Large,
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
            "tw-text-brand-700 dark:tw-text-brand-50":
              type === ButtonType.Main && variant === ButtonVariant.Secondary,
            "tw-text-brand-700 dark:tw-text-brand-200":
              type === ButtonType.Main && variant === ButtonVariant.Tertiary,
            "tw-text-warning-700 dark:tw-text-warning-300":
              type === ButtonType.Warning &&
              variant === ButtonVariant.Secondary,
            "tw-text-warning-700 dark:tw-text-warning-200":
              type === ButtonType.Warning && variant === ButtonVariant.Tertiary,
            "tw-text-destructive-700 dark:tw-text-destructive-300":
              type === ButtonType.Error && variant === ButtonVariant.Secondary,
            "tw-text-destructive-700 dark:tw-text-destructive-200":
              type === ButtonType.Error && variant === ButtonVariant.Tertiary,
            "tw-text-success-700 dark:tw-text-success-400":
              type === ButtonType.Success &&
              variant === ButtonVariant.Secondary,
            "tw-text-success-700 dark:tw-text-success-200":
              type === ButtonType.Success && variant === ButtonVariant.Tertiary,
            "tw-text-natural-50": variant === ButtonVariant.Primary,
            "tw-w-[20px] tw-h-[20px]": size === ButtonSize.Tiny,
          })}
        />
      </span>
      <div
        className={cn(
          loading ? "tw-opacity-0" : "tw-opacity-100",
          "tw-flex tw-flex-row tw-items-center tw-justify-center"
        )}
      >
        {children}
      </div>
    </button>
  );
};

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
        "tw-text-center tw-font-normal tw-transition-all tw-ease-out tw-duration-200 tw-rounded-lg",
        "tw-outline-none tw-transition-all tw-outline-0",
        "tw-w-fit tw-flex tw-items-center tw-justify-center tw-text-base",
        "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
        "tw-flex tw-items-center",
        {
          "focus-visible:tw-bg-brand-900 tw-text-secondary-50 focus-visible:tw-border-brand-200 tw-border tw-bg-brand-700 hover:tw-bg-brand-800 tw-border-brand-700/75 hover:tw-border-brand-800":
            type === ButtonType.Main && variant === ButtonVariant.Primary,
          "focus-visible:tw-bg-brand-200 tw-border tw-text-brand-700 tw-border-brand-700 hover:tw-bg-brand-100":
            type === ButtonType.Main && variant === ButtonVariant.Secondary,
          "tw-bg-success-700 hover:tw-bg-success-800 focus-visible:tw-bg-success-900 tw-text-natural-50 focus-visible:tw-border-success-200":
            type === ButtonType.Success && variant === ButtonVariant.Primary,
          "hover:tw-bg-brand-100 focus-visible:tw-bg-brand-200 tw-border tw-border-brand-700 hover:tw-border-brand-700 focus-visible:tw-border-brand-900 tw-text-success-700" :
            type === ButtonType.Success && variant === ButtonVariant.Secondary,
          "tw-bg-warning-700 hover:tw-bg-warning-800 focus-visible:tw-bg-warning-900 tw-text-natural-50 focus-visible:tw-border-warning-200":
            type === ButtonType.Warning && variant === ButtonVariant.Primary,
          "hover:tw-bg-warning-200 focus-visible:tw-bg-warning-300 tw-text-warning-700 tw-border tw-border-warning-700 hover:tw-border-warning-700 focus-visible:tw-border-warning-900":
            type === ButtonType.Warning && variant === ButtonVariant.Secondary,
          "tw-bg-destructive-700 hover:tw-bg-destructive-800 tw-border tw-border-destructive-500 hover:tw-border-destructive focus-visible:tw-bg-destructive-900 focus-visible:tw-border-error-200 tw-text-secondary-50 ":
            type === ButtonType.Error && variant === ButtonVariant.Primary,
          "hover:tw-bg-destructive-100 tw-border tw-border-destructive-700 hover:tw-border-destructive-300 focus-visible:tw-border-destructive-900 focus-visible:tw-bg-destructive-200 tw-text-destructive-700":
            type === ButtonType.Error && variant === ButtonVariant.Secondary,
          "tw-text-sm tw-px-4 tw-py-2 tw-h-[40px]": size === ButtonSize.Tiny,
          "tw-text-base tw-leading-4 tw-px-6 tw-py-3 tw-h-[48px]":
            size === ButtonSize.Small,
          "tw-text-base tw-px-8 tw-py-4 tw-h-[56px]": size === ButtonSize.Large,
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
            "tw-text-white": type === ButtonType.Main,
            "tw-text-foreground": type === ButtonType.Warning,
            "tw-text-destructive": type === ButtonType.Error,
            "tw-w-[20px] tw-h-[20px]": size === ButtonSize.Tiny,
          })}
        />
      </span>
      <div className={cn(loading ? "tw-opacity-0" : "tw-opacity-100")}>
        {children}
      </div>
    </button>
  );
};

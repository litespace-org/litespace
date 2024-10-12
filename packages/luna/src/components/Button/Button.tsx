import React from "react";
import cn from "classnames";
import { ButtonSize, ButtonType } from "@/components/Button/types";
import Spinner from "@/icons/Spinner";

type Button = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: React.DOMAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  htmlType?: HTMLButtonElement["type"];
  loading?: boolean;
}> = ({
  children,
  type = ButtonType.Primary,
  size = ButtonSize.Large,
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
        "tw-text-center tw-font-normal tw-transition-all tw-ease-out tw-duration-200 tw-rounded-md",
        "tw-outline-none tw-transition-all tw-outline-0 focus-visible:tw-outline-2 focus-visible:tw-outline-offset-1",
        "tw-w-fit tw-flex tw-items-center tw-justify-center tw-text-base",
        "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
        "tw-flex tw-items-center",
        {
          "focus-visible:tw-outline-brand-600 tw-border tw-bg-brand-400 dark:tw-bg-brand-500 hover:tw-bg-brand/80 dark:hover:tw-bg-brand/50 tw-border-brand-500/75 dark:tw-border-brand/30 hover:tw-border-brand-600 dark:hover:tw-border-brand tw-text-foreground":
            type === ButtonType.Primary,
          "tw-bg-background-alternative hover:tw-bg-background-selection dark:tw-bg-muted tw-border tw-border-border-strong hover:tw-border-border-stronger focus-visible:tw-outline-brand-600 tw-text-foreground":
            type === ButtonType.Secondary,
          "hover:tw-bg-surface-300 tw-shadow-none tw-border tw-border-transparent focus-visible:tw-outline-border-strong focus-visible:tw-border-border-stronger":
            type === ButtonType.Text,
          "tw-bg-destructive-300 dark:tw-bg-destructive-400 hover:tw-bg-destructive-400 dark:hover:tw-bg-destructive/50 tw-border tw-border-destructive-500 hover:tw-border-destructive focus-visible:tw-outline-amber-700 tw-text-foreground":
            type === ButtonType.Error,
          "tw-text-xs tw-px-2.5 tw-py-1 tw-h-[26px]": size === ButtonSize.Tiny,
          "tw-text-sm tw-leading-4 tw-px-3 tw-py-2 tw-h-[34px]":
            size === ButtonSize.Small,
          "tw-px-4 tw-py-2 tw-h-[42px]": size === ButtonSize.Large,
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
            "tw-text-white": type === ButtonType.Primary,
            "tw-text-foreground": type === ButtonType.Secondary,
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

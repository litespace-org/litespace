import React from "react";
import cn from "classnames";
import { ButtonSize, ButtonType } from "@/components/Button/types";

type Button = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
}> = ({
  children,
  type = ButtonType.Primary,
  size = ButtonSize.Large,
  onClick,
  disabled,
  className,
}) => {
  return (
    <button
      disabled={disabled}
      data-size={size}
      data-type={type}
      className={cn(
        "ui-font-cairo ui-cursor-pointer ui-text-foreground",
        "ui-space-x-2 ui-text-center ui-font-normal ui-transition-all ui-ease-out ui-duration-200 ui-rounded-md",
        "ui-outline-none ui-transition-all ui-outline-0 focus-visible:ui-outline-2 focus-visible:ui-outline-offset-1",
        "ui-w-full ui-flex ui-items-center ui-justify-center ui-text-base",
        "disabled:ui-opacity-50 disabled:ui-cursor-not-allowed",
        "ui-flex ui-items-center",
        {
          "focus-visible:ui-outline-brand-600 ui-border ui-bg-brand-500 hover:ui-bg-brand/50 ui-border-brand/30 hover:ui-border-brand":
            type === ButtonType.Primary,
          "ui-bg-muted hover:ui-bg-selection ui-border ui-border-border-strong hover:ui-border-border-stronger focus-visible:ui-outline-brand-600":
            type === ButtonType.Secondary,
          "hover:ui-bg-surface-300 ui-shadow-none ui-border ui-border-transparent focus-visible:ui-outline-border-strong focus-visible:ui-border-border-stronger":
            type === ButtonType.Text,
          "ui-bg-destructive-400 hover:ui-bg-destructive/50 ui-border-destructive-500 hover:ui-border-destructive hover:ui-text-hi-contrast focus-visible:ui-outline-amber-700":
            type === ButtonType.Error,
          "ui-text-xs ui-px-2.5 ui-py-1 ui-h-[26px]": size === ButtonSize.Tiny,
          "ui-text-sm ui-leading-4 ui-px-3 ui-py-2 ui-h-[34px]":
            size === ButtonSize.Small,
          "ui-px-4 ui-py-2 ui-h-[42px]": size === ButtonSize.Large,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

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
        "font-cairo cursor-pointer text-foreground",
        "space-x-2 text-center font-normal transition-all ease-out duration-200 rounded-md",
        "outline-none transition-all outline-0 focus-visible:outline-2 focus-visible:outline-offset-1",
        "w-full flex items-center justify-center text-base",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "flex items-center",
        {
          "focus-visible:outline-brand-600 border bg-brand-500 hover:bg-brand/50 border-brand/30 hover:border-brand":
            type === ButtonType.Primary,
          "bg-muted hover:bg-selection border border-border-strong hover:border-border-stronger focus-visible:outline-brand-600":
            type === ButtonType.Secondary,
          "hover:bg-surface-300 shadow-none border border-transparent focus-visible:outline-border-strong focus-visible:border-border-stronger":
            type === ButtonType.Text,
          "bg-destructive-400 hover:bg-destructive/50 border-destructive-500 hover:border-destructive hover:text-hi-contrast focus-visible:outline-amber-700":
            type === ButtonType.Error,
          "text-xs px-2.5 py-1 h-[26px]": size === ButtonSize.Tiny,
          "text-sm leading-4 px-3 py-2 h-[34px]": size === ButtonSize.Small,
          "px-4 py-2 h-[42px]": size === ButtonSize.Large,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

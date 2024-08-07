import React from "react";
import cn from "classnames";
import { Variant, Color } from "@/components/Button/types";

type Button = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  type?: Button["type"];
  variant?: Variant;
  color?: Color;
  disabled?: boolean;
}> = ({
  children,
  type,
  variant = Variant.Filled,
  color = Color.Primary,
  onClick,
  disabled,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "ui-py-lg ui-px-sm-section ui-font-bold",
        "ui-font-cairo ui-rounded-2xl ui-text-[24px]",
        "flex ui-items-center ui-justify-center",
        "disabled:ui-bg-dark-56 disabled:ui-cursor-not-allowed",
        {
          "ui-text-white": variant === Variant.Filled,
          "ui-bg-transparent ui-border-[2px] ui-border-solid ui-border-blue-normal ui-text-blue-normal disabled:ui-text-dark-56 disabled:ui-border-dark-56 disabled:ui-bg-transparent":
            variant === Variant.Outlined,
          "ui-text-blue-normal":
            variant === Variant.Outlined && color === Color.Primary,
          "ui-border-error ui-text-error":
            variant === Variant.Outlined && color === Color.Error,
          "ui-bg-blue-normal": color === Color.Primary,
          "ui-bg-error": color === Color.Error,
        }
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

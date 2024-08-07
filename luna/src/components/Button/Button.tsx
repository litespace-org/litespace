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
        "ui-py-xxl ui-px-sm-section",
        "ui-font-cairo ui-rounded-2xl ui-text-[24px] ui-text-white",
        "ui-font-bold ui-leading-normal",
        "disabled:ui-bg-dark-56 disabled:ui-cursor-not-allowed",
        {
          "ui-bg-transparent ui-border-[2px] ui-border-solid ui-border-blue-normal ui-text-blue-normal disabled:ui-text-dark-56 disabled:ui-border-dark-56 disabled:ui-bg-transparent":
            variant === Variant.Outlined,
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

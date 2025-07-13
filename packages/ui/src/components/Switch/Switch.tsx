import React from "react";
import { Root, Thumb } from "@radix-ui/react-switch";
import cn from "classnames";
import { Size } from "@litespace/types";

export type SwitchProps = {
  id?: string;
  size?: Size;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export const Switch: React.FC<SwitchProps> = ({
  id,
  size = "small",
  checked,
  onChange,
  disabled,
}) => {
  return (
    <Root
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center rounded-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-offset-1 disabled:cursor-not-allowed transition-colors",
        "disabled:opacity-50 data-[state=checked]:bg-brand-500",
        "data-[state=unchecked]:bg-natural-400 group",
        {
          "h-10 w-[88px]": size === "large",
          "h-8 w-20": size === "medium",
          "h-7 w-[65px]": size === "small",
        }
      )}
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    >
      <Thumb
        className={cn(
          "block rounded-full shadow-switch-thumb",
          "transition-all duration-200",
          "bg-natural-50 group-hover:bg-brand-100",
          "data-[state=checked]:translate-x-[-2px]",
          {
            "h-9 w-9 data-[state=unchecked]:translate-x-[-50px]":
              size === "large",
            "h-7 w-7 data-[state=unchecked]:translate-x-[-50px]":
              size === "medium",
            "h-6 w-6 data-[state=unchecked]:translate-x-[-39px]":
              size === "small",
          }
        )}
      />
    </Root>
  );
};

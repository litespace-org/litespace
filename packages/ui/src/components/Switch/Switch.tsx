import React from "react";
import { Root, Thumb } from "@radix-ui/react-switch";
import cn from "classnames";

export type SwitchProps = {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <Root
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center rounded-full",
        "border border-border transition-colors focus-visible:outline-none ",
        "focus-visible:ring-2 focus-visible:ring-border focus-visible:outline-offset-1 disabled:cursor-not-allowed",
        "disabled:opacity-50 data-[state=checked]:bg-brand-500",
        "data-[state=unchecked]:bg-natural-400 h-[38px] w-[88px] group",
        "hover:shadow-switch-root transition-shadow duration-200"
      )}
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    >
      <Thumb
        className={cn(
          "block rounded-full shadow-switch-thumb",
          "h-[34px] w-[34px]",
          "transition-all duration-200",
          "bg-natural-50 group-hover:bg-brand-100",
          "data-[state=checked]:translate-x-[-2px] data-[state=unchecked]:translate-x-[-50px]"
        )}
      />
    </Root>
  );
};

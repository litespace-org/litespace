import React from "react";
import { Root, Thumb } from "@radix-ui/react-switch";
import cn from "classnames";

export const Switch: React.FC<{
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}> = ({ id, checked, onChange }) => {
  return (
    <Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full",
        "border border-border transition-colors focus-visible:outline-none ",
        "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-offset-1 disabled:cursor-not-allowed",
        "disabled:opacity-50 data-[state=checked]:bg-brand data-[state=checked]:hover:bg-brand-600/90",
        "data-[state=unchecked]:bg-control data-[state=unchecked]:hover:bg-border h-[24px] w-[44px]"
      )}
      id={id}
      checked={checked}
      onCheckedChange={onChange}
    >
      <Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-foreground-lighter",
          "data-[state=checked]:bg-white shadow-lg",
          "ring-0 transition-transform h-[18px] w-[18px]",
          "data-[state=checked]:translate-x-[-22px] data-[state=unchecked]:translate-x-[-3px]"
        )}
      />
    </Root>
  );
};

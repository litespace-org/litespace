import React from "react";
import { Root, Thumb } from "@radix-ui/react-switch";
import cn from "classnames";

export const Switch: React.FC<{
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ id, checked, onChange, disabled }) => {
  return (
    <Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full",
        "border border-border transition-colors focus-visible:outline-none ",
        "focus-visible:ring-2 focus-visible:ring-border focus-visible:outline-offset-1 disabled:cursor-not-allowed",
        "disabled:opacity-50 data-[state=checked]:bg-brand data-[state=checked]:hover:bg-brand",
        "data-[state=unchecked]:bg-foreground-muted/40 data-[state=unchecked]:hover:bg-foreground-muted/60 h-[24px] w-[44px]"
      )}
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
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

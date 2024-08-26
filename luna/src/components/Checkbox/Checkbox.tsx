import React from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import cn from "classnames";

export const Checkbox: React.FC<{
  id?: string;
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}> = ({ id, label, checked, onCheckedChange }) => {
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
    >
      <Root
        className={cn(
          "w-[25px] h-[25px] bg-surface-300 hover:bg-selection flex items-center justify-center rounded-md",
          "outline-none focus:ring-2 focus:ring-brand/50",
          "transition-colors duration-200"
        )}
        checked={checked}
        onCheckedChange={onCheckedChange}
        id={id}
      >
        <Indicator className="text-foreground">
          <CheckIcon />
        </Indicator>
      </Root>
      <label
        className="pr-2 text-[13px] leading-none text-foreground cursor-pointer"
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
};

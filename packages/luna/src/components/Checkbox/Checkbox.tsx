import React from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
// import { CheckIcon } from "@radix-ui/react-icons";
import cn from "classnames";

export const Checkbox: React.FC<{
  id?: string;
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}> = ({ id, label, checked, onCheckedChange }) => {
  return (
    <div className="tw-flex tw-items-center tw-cursor-pointer">
      <Root
        className={cn(
          "tw-w-[25px] tw-h-[25px] tw-bg-surface-300 hover:tw-bg-selection tw-flex tw-items-center tw-justify-center tw-rounded-md",
          "tw-outline-none focus:tw-ring-2 focus:tw-ring-brand/50",
          "tw-transition-colors tw-duration-200 tw-shrink-0"
        )}
        checked={checked}
        onCheckedChange={onCheckedChange}
        id={id}
      >
        <Indicator className="tw-text-foreground">
          {/* <CheckIcon /> */}
        </Indicator>
      </Root>
      <label
        className="tw-pr-2 tw-text-[13px] tw-leading-none tw-text-foreground tw-cursor-pointer tw-w-full"
        htmlFor={id}
        onClick={() => onCheckedChange && onCheckedChange(!checked)}
      >
        {label}
      </label>
    </div>
  );
};

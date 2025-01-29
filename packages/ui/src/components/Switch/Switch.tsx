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
        "tw-inline-flex tw-shrink-0 tw-cursor-pointer tw-items-center tw-rounded-full",
        "tw-border tw-border-border tw-transition-colors focus-visible:tw-outline-none ",
        "focus-visible:tw-ring-2 focus-visible:tw-ring-border focus-visible:tw-outline-offset-1 disabled:tw-cursor-not-allowed",
        "disabled:tw-opacity-50 data-[state=checked]:tw-bg-brand-500",
        "data-[state=unchecked]:tw-bg-natural-400 tw-h-[38px] tw-w-[88px] tw-group",
        "hover:tw-shadow-switch-root tw-transition-shadow tw-duration-200"
      )}
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    >
      <Thumb
        className={cn(
          "tw-block tw-rounded-full tw-shadow-switch-thumb",
          "tw-h-[34px] tw-w-[34px]",
          "tw-transition-all tw-duration-200",
          "tw-bg-natural-50 group-hover:tw-bg-brand-100",
          "data-[state=checked]:tw-translate-x-[-2px] data-[state=unchecked]:tw-translate-x-[-50px]"
        )}
      />
    </Root>
  );
};

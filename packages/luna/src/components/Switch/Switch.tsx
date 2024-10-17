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
        "disabled:tw-opacity-50 data-[state=checked]:tw-bg-brand data-[state=checked]:hover:tw-bg-brand",
        "data-[state=unchecked]:tw-bg-foreground-muted/40 data-[state=unchecked]:hover:tw-bg-foreground-muted/60 tw-h-[24px] tw-w-[44px]"
      )}
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    >
      <Thumb
        className={cn(
          "tw-pointer-events-none tw-block tw-rounded-full tw-bg-foreground-lighter",
          "data-[state=checked]:tw-bg-white tw-shadow-lg",
          "tw-ring-0 tw-transition-transform tw-h-[18px] tw-w-[18px]",
          "data-[state=checked]:tw-translate-x-[-22px] data-[state=unchecked]:tw-translate-x-[-3px]"
        )}
      />
    </Root>
  );
};

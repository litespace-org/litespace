import React from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
import Check from "@litespace/assets/Check";
import cn from "classnames";

const CheckboxV2: React.FC<{
  disabled?: boolean;
  checked?: boolean;
  id?: string;
  onCheckedChange?: (checked: boolean) => void;
}> = ({ disabled, checked, id, onCheckedChange }) => {
  return (
    <div
      className={cn(
        "tw-h-10 tw-w-10 tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-200",
        "tw-rounded-full hover:tw-bg-brand-50 active:tw-bg-brand-200 tw-shrink-0"
      )}
    >
      <Root
        disabled={disabled}
        checked={checked}
        onCheckedChange={onCheckedChange}
        id={id}
        className={cn(
          "tw-border-2 tw-border-brand-500 tw-w-[1.125rem] tw-h-[1.125rem] tw-rounded-sm",
          "data-[state=checked]:tw-bg-brand-500 tw-transition-all tw-duration-200 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
        )}
      >
        <Indicator className="tw-text-natural-50">
          <Check />
        </Indicator>
      </Root>
    </div>
  );
};

export default CheckboxV2;

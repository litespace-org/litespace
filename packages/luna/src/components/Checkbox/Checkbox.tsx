import React from "react";
import { Check } from "react-feather";
import cn from "classnames";
import { Void } from "@litespace/types";
// import { CheckIcon } from "@radix-ui/react-icons";

export const Checkbox: React.FC<{
  id?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: Void;
  checkBoxClassName?: string;
  containerClassName?: string;
}> = ({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
  checkBoxClassName,
  containerClassName,
}) => {
  return (
    <div
      className={cn(
        "tw-flex tw-items-center tw-cursor-pointer",
        containerClassName
      )}
    >
      <div
        tabIndex={1}
        className="hover:tw-bg-brand-100 tw-rounded-full tw-w-10 tw-h-10 tw-flex tw-justify-center tw-items-center active:tw-bg-brand-200"
      >
        <div
          role="checkbox"
          onClick={onCheckedChange}
          className={cn(
            "tw-border-2 tw-border-brand-500 tw-flex tw-justify-center tw-items-center tw-rounded-sm tw-h-[18px] tw-w-[18px]",
            checked && "tw-bg-brand-500",
            disabled && "tw-opacity-50",
            checkBoxClassName
          )}
        >
          {checked ? (
            <Check className="tw-w-4 tw-h-4 tw-text-natural-50" />
          ) : null}
        </div>
      </div>
      <label
        className="tw-pr-2 tw-text-[13px] tw-leading-none tw-text-foreground tw-cursor-pointer tw-w-full"
        htmlFor={id}
        onClick={() => onCheckedChange && onCheckedChange()}
      >
        {label}
      </label>
    </div>
  );
};

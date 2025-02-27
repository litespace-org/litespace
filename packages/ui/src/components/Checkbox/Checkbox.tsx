import React from "react";
import { Check } from "react-feather";
import cn from "classnames";
import { Void } from "@litespace/types";

export const Checkbox: React.FC<{
  id?: string;
  label?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: Void;
  disabled?: boolean;
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
        "flex items-center cursor-pointer",
        disabled && "pointer-events-none",
        containerClassName
      )}
    >
      <div
        tabIndex={1}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (onCheckedChange) onCheckedChange();
          }
        }}
        className="hover:bg-brand-100 rounded-full w-10 h-10 flex justify-center items-center active:bg-brand-200"
      >
        <div
          role="checkbox"
          id={id}
          onClick={onCheckedChange}
          className={cn(
            "border-2 border-brand-500 flex justify-center items-center rounded-sm h-[18px] w-[18px]",
            checked && "bg-brand-500",
            disabled && "opacity-50 pointer-events-none",
            checkBoxClassName
          )}
        >
          {checked ? <Check className="w-4 h-4 text-natural-50" /> : null}
        </div>
      </div>
      <label
        className="pr-2 text-[13px] leading-none text-foreground cursor-pointer w-full"
        htmlFor={id}
        onClick={onCheckedChange}
      >
        {label}
      </label>
    </div>
  );
};

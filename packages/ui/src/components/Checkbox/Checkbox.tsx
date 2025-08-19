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
        className="hover:bg-brand-100 rounded-full flex justify-center items-center"
      >
        <div
          role="checkbox"
          id={id}
          onClick={onCheckedChange}
          className={cn(
            "border flex justify-center items-center rounded-sm h-4 w-4",
            checked ? "bg-brand-500 border-brand-500" : "border-natural-500",

            disabled && "opacity-50 pointer-events-none",
            checkBoxClassName
          )}
        >
          {checked ? <Check className="w-4 h-4 text-natural-50" /> : null}
        </div>
      </div>
      <label
        className="font-cairo font-semibold pr-2 text-tiny leading-[150%] text-natural-600 cursor-pointer w-full"
        htmlFor={id}
        onClick={onCheckedChange}
      >
        {label}
      </label>
    </div>
  );
};

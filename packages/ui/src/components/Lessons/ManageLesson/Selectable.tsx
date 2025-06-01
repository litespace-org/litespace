import React from "react";
import { RadioButton } from "@/components/RadioButton";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";
import cn from "classnames";

export const Selectable: React.FC<{
  disabled: boolean;
  isSelected: boolean;
  label: string;
  name?: string;
  onSelect: Void;
}> = ({ disabled, name, label, isSelected, onSelect }) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        "p-2 flex items-center gap-2",
        "cursor-pointer disabled:cursor-not-allowed",
        "w-full border border-natural-100 rounded-2xl",
        disabled && "opacity-50"
      )}
      onClick={onSelect}
      type="button"
    >
      <RadioButton name={name} checked={isSelected} disabled={disabled} />
      <Typography tag="p" className="text-tiny font-semibold text-natural-950">
        {label}
      </Typography>
    </button>
  );
};

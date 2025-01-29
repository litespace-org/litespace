import React from "react";
import cn from "classnames";

export const Field: React.FC<{
  className?: string;
  label?: React.ReactNode;
  field?: React.ReactNode;
  variant?: "column" | "row";
}> = ({ className, label, field, variant = "column" }) => {
  return (
    <div
      className={cn(
        "tw-flex tw-gap-2 tw-w-full",
        variant == "column" ? "tw-flex-col" : "tw-flex-row tw-justify-between",
        className
      )}
    >
      {label}
      {field}
    </div>
  );
};

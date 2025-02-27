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
        "flex gap-2 w-full",
        variant == "column" ? "flex-col" : "flex-row justify-between",
        className
      )}
    >
      {label}
      {field}
    </div>
  );
};

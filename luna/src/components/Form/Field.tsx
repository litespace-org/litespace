import React from "react";
import cn from "classnames";

export const Field: React.FC<{
  className?: string;
  label?: React.ReactNode;
  field?: React.ReactNode;
}> = ({ className, label, field }) => {
  return (
    <div className={cn("tw-flex tw-flex-col tw-gap-2 tw-w-full", className)}>
      {label}
      {field}
    </div>
  );
};

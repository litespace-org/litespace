import React from "react";
import cn from "classnames";

export const Field: React.FC<{
  className?: string;
  label?: React.ReactNode;
  field?: React.ReactNode;
}> = ({ className, label, field }) => {
  return (
    <div className={cn("ui-mb-5 ui-w-full", className)}>
      {label}
      {field}
    </div>
  );
};

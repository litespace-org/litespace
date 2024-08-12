import React from "react";
import cn from "classnames";

export const Field: React.FC<{
  className?: string;
  label?: React.ReactNode;
  field?: React.ReactNode;
}> = ({ className, label, field }) => {
  return (
    <div className={cn("mb-5 flex flex-col gap-2 w-full", className)}>
      {label}
      {field}
    </div>
  );
};

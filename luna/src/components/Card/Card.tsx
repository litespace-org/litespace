import React from "react";
import cn from "classnames";

export const Card: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "tw-bg-surface-100 tw-px-6 tw-py-4 tw-border tw-border-border tw-rounded",
        className
      )}
    >
      {children}
    </div>
  );
};

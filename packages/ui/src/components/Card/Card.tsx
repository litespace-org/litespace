import React from "react";
import cn from "classnames";

export const Card: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-surface-100 px-6 py-4 border border-border rounded",
        className
      )}
    >
      {children}
    </div>
  );
};

import React from "react";
import cn from "classnames";

export const Card: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-surface-100 p-6 border border-border rounded h-full",
        className
      )}
    >
      {children}
    </div>
  );
};

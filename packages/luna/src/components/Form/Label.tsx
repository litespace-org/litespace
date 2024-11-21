import React, { ReactNode } from "react";
import cn from "classnames";

export const Label: React.FC<{
  id?: string;
  children?: ReactNode;
  className?: string;
}> = ({ id, children, className }) => {
  return (
    <label htmlFor={id} className={cn("tw-block tw-text-foreground-light tw-text-sm", className)}>
      {children}
    </label>
  );
};

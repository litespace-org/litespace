import React, { ReactNode } from "react";
import cn from "classnames";

export const Label: React.FC<{
  id?: string;
  children?: ReactNode;
}> = ({ id, children }) => {
  return (
    <label htmlFor={id} className={cn("tw-block tw-text-foreground-light tw-text-sm")}>
      {children}
    </label>
  );
};

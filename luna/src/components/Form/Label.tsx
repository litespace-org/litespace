import React, { ReactNode } from "react";
import cn from "classnames";

export const Label: React.FC<{
  id?: string;
  children?: ReactNode;
}> = ({ id, children }) => {
  return (
    <label htmlFor={id} className={cn("block text-foreground-light text-sm")}>
      {children}
    </label>
  );
};

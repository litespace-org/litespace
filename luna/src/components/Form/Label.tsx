import React, { ReactNode } from "react";
import cn from "classnames";

export const Label: React.FC<{
  id?: string;
  children?: ReactNode;
}> = ({ id, children }) => {
  return (
    <label
      htmlFor={id}
      className={cn("ui-block ui-text-foreground-light ui-text-sm")}
    >
      {children}
    </label>
  );
};

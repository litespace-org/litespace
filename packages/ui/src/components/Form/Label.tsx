import React, { ReactNode } from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";

export const Label: React.FC<{
  id?: string;
  children?: ReactNode;
  className?: string;
}> = ({ id, children, className }) => {
  return (
    <Typography
      tag="label"
      htmlFor={id}
      className={cn(
        "tw-block tw-text-natural-950 tw-mb-2", 
        "tw-text-xl tw-font-normal",
        className
      )}
    >
      {children}
    </Typography>
  );
};

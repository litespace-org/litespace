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
        "block text-natural-950 mb-2",
        "text-subtitle-2 font-normal",
        className
      )}
    >
      {children}
    </Typography>
  );
};

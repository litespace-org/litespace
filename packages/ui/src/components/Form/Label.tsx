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
      element="subtitle-2"
      weight="regular"
      tag="label"
      htmlFor={id}
      className={cn("tw-block tw-text-natural-950 tw-mb-2", className)}
    >
      {children}
    </Typography>
  );
};

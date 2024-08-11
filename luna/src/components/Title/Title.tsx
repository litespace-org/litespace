import React from "react";
import cn from "classnames";

export const Title: React.FC<{
  level?: number;
  children?: React.ReactNode;
  className?: string;
}> = ({ level = 1, children, className }) => {
  return React.createElement(`h${level}`, {
    children,
    className: cn(
      "ui-font-cairo",
      {
        k: level === 1,
        kk: level === 2,
      },
      className
    ),
  });
};

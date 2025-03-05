import React from "react";
import cn from "classnames";

const TruncateField: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn("truncate", className)}>{children}</div>;
};

export default TruncateField;

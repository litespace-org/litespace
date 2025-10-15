import React from "react";
import cn from "classnames";

type Props = React.HtmlHTMLAttributes<HTMLDivElement>;

export const PageContainer: React.FC<Props> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("max-w-screen-3xl mx-auto w-full p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

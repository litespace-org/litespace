import React from "react";
import cn from "classnames";

const PageContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-natural-50 border border-natural-100 shadow-page-content rounded-3xl w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContent;

import React from "react";
import cn from "classnames";

const PageContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "md:bg-natural-50 md:border md:border-natural-100 md:shadow-page-content md:rounded-3xl md:w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContent;

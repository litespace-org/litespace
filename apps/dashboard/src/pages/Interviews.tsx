import Content from "@/components/Interviews/Content";
import cn from "classnames";
import React from "react";

export const Interviews: React.FC = () => {
  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <Content />
    </div>
  );
};

export default Interviews;

import React from "react";
import { Toaster } from "@litespace/luna";
import { Outlet } from "react-router-dom";
import cn from "classnames";

const Root: React.FC = () => {
  return (
    <div className={cn("min-h-screen text-foreground flex flex-col")}>
      <Toaster />
      <Outlet />
    </div>
  );
};

export default Root;

import { Toaster } from "@litespace/luna";
import React from "react";
import { Outlet } from "react-router-dom";

const Root: React.FC = () => {
  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Toaster />
      <Outlet />
    </div>
  );
};

export default Root;

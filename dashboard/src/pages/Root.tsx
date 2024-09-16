import React from "react";
import { Toaster } from "@litespace/luna";
import { Outlet } from "react-router-dom";

const Root: React.FC = () => {
  return (
    <main>
      <Outlet />
      <Toaster />
    </main>
  );
};

export default Root;

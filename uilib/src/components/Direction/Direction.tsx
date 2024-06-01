import React from "react";

export const Direction: React.FC<{
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
}> = ({ dir = "rtl", children }) => {
  return <div dir={dir}>{children}</div>;
};

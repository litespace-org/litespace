import React from "react";
import { Dir } from "@/components/Direction/types";

export const Direction: React.FC<{
  dir?: Dir;
  children: React.ReactNode;
}> = ({ dir = Dir.RTL, children }) => {
  return <div dir={dir}>{children}</div>;
};

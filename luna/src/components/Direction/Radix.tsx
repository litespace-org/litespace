import { DirectionProvider } from "@radix-ui/react-direction";
import { Dir } from "@/components/Direction/types";
import React from "react";

export const RadixDirection: React.FC<{
  dir: Dir;
  children: React.ReactNode;
}> = ({ dir, children }) => {
  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
};

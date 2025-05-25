import React from "react";
import { Dir } from "@/components/Direction/types";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";

export const Direction: React.FC<{
  dir?: Dir;
  children: React.ReactNode;
}> = ({ dir = "rtl", children }) => {
  return (
    <RadixDirectionProvider dir={dir}>
      <div dir={dir}>{children}</div>
    </RadixDirectionProvider>
  );
};

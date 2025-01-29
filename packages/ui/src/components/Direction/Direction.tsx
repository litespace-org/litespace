import React from "react";
import { Dir } from "@/components/Direction/types";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";

export const Direction: React.FC<{
  dir?: Dir;
  children: React.ReactNode;
}> = ({ dir = Dir.RTL, children }) => {
  return (
    <RadixDirectionProvider dir={dir}>
      <main dir={dir}>{children}</main>
    </RadixDirectionProvider>
  );
};

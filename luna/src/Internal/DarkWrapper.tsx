import { Direction } from "@/components/Direction";
import React from "react";

export function DrarkWrapper({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactNode {
  return (
    <Direction>
      <div className="w-[900px] h-[900px] flex items-center justify-center text-foreground font-cairo bg-background-200">
        <div className="w-[600px] flex items-center justify-center">
          {children}
        </div>
      </div>
    </Direction>
  );
}

export const DarkStoryWrapper = (Story: React.FC) => (
  <DrarkWrapper>
    <Story />
  </DrarkWrapper>
);

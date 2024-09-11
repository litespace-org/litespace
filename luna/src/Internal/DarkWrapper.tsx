import { Direction } from "@/components/Direction";
import React from "react";

export function DrarkWrapper({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactNode {
  return (
    <Direction>
      <div className="min-w-[900px] min-h-[900px] flex items-center justify-center text-foreground font-cairo bg-dash-sidebar p-10">
        <div className="min-w-[600px] min-h-[600px] flex flex-col">
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

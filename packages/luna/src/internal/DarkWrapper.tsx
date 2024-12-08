import { Direction } from "@/components/Direction";
import React from "react";

export function DarkWrapper({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactNode {
  return (
    <Direction>
      <div className="tw-min-w-[900px] tw-min-h-[900px] tw-flex tw-items-center tw-justify-center tw-text-foreground tw-font-cairo tw-bg-dash-sidebar tw-p-10">
        <div className="tw-min-w-[600px] tw-min-h-[600px] tw-flex tw-flex-col">
          {children}
        </div>
      </div>
    </Direction>
  );
}

export const DarkStoryWrapper = (Story: React.FC) => (
  <DarkWrapper>
    <Story />
  </DarkWrapper>
);

import { Direction } from "@/components/Direction";
import React from "react";

export function DrarkWrapper(Story: React.FC): React.ReactNode {
  return (
    <Direction>
      <div className="w-[900px] h-[900px] flex items-center justify-center bg-dash-sidebar text-foreground font-cairo">
        <div className="w-[600px]">
          <Story />
        </div>
      </div>
    </Direction>
  );
}

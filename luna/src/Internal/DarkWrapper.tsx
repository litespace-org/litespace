import { Direction } from "@/components/Direction";
import React from "react";

export function DrarkWrapper(Story: React.FC): React.ReactNode {
  return (
    <Direction>
      <div className="w-[900px] h-[900px] flex items-center justify-center text-foreground font-cairo bg-background-200">
        <div className="w-[600px] flex items-center justify-center">
          <Story />
        </div>
      </div>
    </Direction>
  );
}

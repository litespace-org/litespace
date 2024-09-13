import React from "react";
import { TimelineItem } from "@/components/Timeline/types";

export const Timeline: React.FC<{
  timeline: TimelineItem[];
}> = ({ timeline }) => {
  return (
    <ol className="border-r border-r-border-strong relative">
      {timeline.map(({ id, children, icon }) => {
        return (
          <li key={id} className="mb-10 ms-6">
            <span className="absolute flex items-center justify-center _w-6 _h-6 rounded-full -start-3 ring-8 ring-dash-sidebar text-foreground bg-dash-sidebar">
              {icon}
            </span>

            {children}
          </li>
        );
      })}
    </ol>
  );
};

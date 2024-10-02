import React from "react";
import { TimelineItem } from "@/components/Timeline/types";

export const Timeline: React.FC<{
  timeline: TimelineItem[];
}> = ({ timeline }) => {
  return (
    <ol className="tw-border-r tw-border-r-border-strong tw-relative">
      {timeline.map(({ id, children, icon }) => {
        return (
          <li key={id} className="tw-mb-10 tw-ms-6">
            <span className="tw-absolute tw-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-rounded-full -tw-start-3 tw-ring-8 tw-ring-dash-sidebar tw-text-foreground tw-bg-dash-sidebar">
              {icon}
            </span>

            {children}
          </li>
        );
      })}
    </ol>
  );
};

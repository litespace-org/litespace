import { IRule } from "@litespace/types";
import React from "react";
import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { motion } from "framer-motion";

export const TimeSelection: React.FC<{
  events: IRule.RuleEvent[];
  start: string | null;
  setStart: (start: string) => void;
}> = ({ events, start, setStart }) => {
  return (
    <div className="tw-px-5">
      <div
        className={cn(
          "tw-grid tw-grid-cols-6 tw-gap-x-4 tw-gap-y-8 tw-max-h-96 tw-overflow-y-auto",
          "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent tw-p-5"
        )}
      >
        {events.map((event) => {
          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              key={event.start}
              onClick={() => setStart(event.start)}
              data-selected={event.start === start}
              className={cn(
                "tw-bg-natural-50 tw-border tw-border-natural-800 tw-shadow-time-selection-item",
                "tw-h-24 tw-w-24 tw-rounded-lg tw-flex tw-items-center tw-justify-center",
                "data-[selected=false]:hover:tw-bg-brand-100 tw-transition-colors tw-duration-300",
                "data-[selected=true]:tw-bg-brand-700 data-[selected=true]:tw-border-brand-800"
              )}
            >
              <Typography
                element="subtitle-2"
                data-selected={event.start === start}
                className="tw-text-natural-950 data-[selected=true]:tw-text-natural-50 tw-transition-colors tw-duration-300"
              >
                {dayjs(event.start).format("hh:mm a")}
              </Typography>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

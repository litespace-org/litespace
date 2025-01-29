import React from "react";
import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { motion } from "framer-motion";
import { AttributedSlot } from "@/components/Lessons/BookLesson/types";

export const TimeSelection: React.FC<{
  slots: AttributedSlot[];
  start: string | null;
  ruleId: number | null;
  slotId: number | null;
  select: (payload: { start: string; ruleId: number; slotId: number }) => void;
}> = ({ slots, start, ruleId, slotId, select }) => {
  return (
    <div className="tw-px-5">
      <div
        className={cn(
          "tw-grid tw-grid-cols-7 tw-gap-4 tw-max-h-96 tw-overflow-y-auto",
          "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent tw-pt-2 tw-p-5"
        )}
      >
        {slots.map((slot) => {
          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              key={slot.start}
              onClick={() =>
                select({
                  ruleId: slot.ruleId,
                  slotId: slot.ruleId,
                  start: slot.start,
                })
              }
              data-selected={
                slot.start === start &&
                slot.ruleId === ruleId &&
                slot.ruleId === slotId
              }
              disabled={!slot.bookable}
              className={cn(
                "tw-bg-natural-50 tw-border tw-border-natural-800 tw-shadow-time-selection-item",
                "tw-h-[60px] tw-w-[60px] tw-rounded-lg tw-flex tw-items-center tw-justify-center",
                "data-[selected=false]:hover:tw-bg-brand-100 tw-transition-colors tw-duration-300",
                "data-[selected=true]:tw-bg-brand-700 data-[selected=true]:tw-border-brand-800",
                "disabled:tw-opacity-20 disabled:tw-cursor-not-allowed"
              )}
            >
              <Typography
                element="tiny-text"
                data-selected={slot.start === start}
                className="tw-text-natural-950 data-[selected=true]:tw-text-natural-50 tw-transition-colors tw-duration-300"
              >
                {dayjs(slot.start).format("hh:mm a")}
              </Typography>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

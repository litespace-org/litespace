import React from "react";
import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { motion } from "framer-motion";
import { IAvailabilitySlot } from "@litespace/types";

export const TimeSelection: React.FC<{
  slots: Array<IAvailabilitySlot.SubSlot & { bookable: boolean }>;
  start: string | null;
  slotId: number | null;
  select: (slotId: number, start: string) => void;
}> = ({ slots, start, slotId, select }) => {
  return (
    <div className="lg:tw-px-8">
      <div
        className={cn(
          "tw-grid tw-grid-cols-[repeat(auto-fill,minmax(60px,1fr))] tw-gap-2 lg:tw-gap-4 tw-max-h-96 tw-overflow-y-auto",
          "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent"
        )}
      >
        {slots.map((slot) => {
          return (
            <motion.button
              whileHover={{ scale: slot.bookable ? 1.05 : 1 }}
              whileTap={{ scale: slot.bookable ? 0.95 : 1 }}
              type="button"
              key={slot.start}
              disabled={!slot.bookable}
              onClick={() => select(slot.parent, slot.start)}
              data-selected={slot.start === start && slot.parent === slotId}
              className={cn(
                "tw-bg-natural-50 tw-border tw-border-natural-800 tw-shadow-time-selection-item",
                "tw-w-[59px] tw-h-[48px] lg:tw-h-[60px] lg:tw-w-[60px] tw-rounded-lg tw-flex tw-items-center tw-justify-center",
                "data-[selected=false]:hover:tw-bg-brand-100 tw-transition-colors tw-duration-300",
                "data-[selected=true]:tw-bg-brand-700 data-[selected=true]:tw-border-brand-800",
                "disabled:tw-opacity-20 disabled:tw-cursor-not-allowed disabled:hover:tw-bg-natural-50"
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

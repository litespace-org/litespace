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
    <div className="lg:px-8">
      <div
        className={cn(
          "grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2 md:gap-4 max-h-96 overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent px-4 md:px-6"
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
                "bg-natural-50 border border-natural-800 shadow-time-selection-item",
                "mx-auto h-12 w-[59px] md:h-[60px] md:w-[60px] rounded-lg flex items-center justify-center",
                "data-[selected=false]:hover:bg-brand-100 transition-colors duration-300",
                "data-[selected=true]:bg-brand-700 data-[selected=true]:border-brand-800",
                "disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-natural-50"
              )}
            >
              <Typography
                tag="span"
                data-selected={slot.start === start}
                className="text-natural-950 data-[selected=true]:text-natural-50 transition-colors duration-300 text-tiny"
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

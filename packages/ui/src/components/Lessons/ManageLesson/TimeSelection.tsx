import React from "react";
import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { motion } from "framer-motion";
import { IAvailabilitySlot, Void } from "@litespace/types";

export const TimeSelection: React.FC<{
  slots: Array<IAvailabilitySlot.SubSlot & { bookable: boolean }>;
  start: string | null;
  slotId: number | null;
  select: (slotId: number, start: string) => void;
}> = ({ slots, start, slotId, select }) => {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 md:gap-x-3 md:gap-y-[10px] max-h-[350px] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent mt-8 mb-6"
      )}
    >
      {slots.map((slot) => {
        const selected = slot.start === start && slot.parent === slotId;
        return (
          <Slot
            onSelect={() => select(slot.parent, slot.start)}
            slot={slot}
            selected={selected}
          />
        );
      })}
    </div>
  );
};

const Slot: React.FC<{
  slot: IAvailabilitySlot.SubSlot & {
    bookable: boolean;
  };
  selected: boolean;
  onSelect: Void;
}> = ({ slot, selected, onSelect }) => {
  return (
    <motion.button
      whileHover={{ scale: slot.bookable ? 1.05 : 1 }}
      whileTap={{ scale: slot.bookable ? 0.95 : 1 }}
      type="button"
      key={slot.start}
      disabled={!slot.bookable}
      onClick={onSelect}
      className={cn(
        "border shadow-time-selection-item transition-colors duration-300",
        "h-20 w-20 rounded-lg flex items-center justify-center",
        selected
          ? "bg-brand-700 border-brand-800"
          : "border-natural-200 hover:bg-brand-100 hover:border-natural-300 bg-natural-50",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-natural-50"
      )}
    >
      <Typography
        tag="span"
        className={cn(
          "transition-colors duration-300 text-tiny",
          selected ? "text-natural-50" : "text-natural-700"
        )}
      >
        {dayjs(slot.start).format("hh:mm a")}
      </Typography>
    </motion.button>
  );
};

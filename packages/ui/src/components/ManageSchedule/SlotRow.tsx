import { useFormatMessage } from "@/hooks";
import { IAvailabilitySlot, Void } from "@litespace/types";
import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import Close from "@litespace/assets/Close";
import AddCircle from "@litespace/assets/AddCircle";
import { Typography } from "@/components/Typography";
import { Select, SelectList } from "@/components/Select";
import { AnimatePresence, motion } from "framer-motion";
import { getSubSlotsBatch, orderSlots } from "@litespace/utils";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const Animate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {children}
    </motion.div>
  );
};

const SlotRow: React.FC<{
  freeSubSlots: IAvailabilitySlot.SubSlot[];
  start?: string;
  end?: string;
  disabled?: boolean;
  remove?: Void;
  add?: Void;
  onFromChange?: (value: string) => void;
  onToChange?: (value: string) => void;
}> = ({
  freeSubSlots,
  start,
  end,
  disabled,
  remove,
  add,
  onFromChange,
  onToChange,
}) => {
  const intl = useFormatMessage();

  const subslots = useMemo(() => {
    return orderSlots(getSubSlotsBatch(freeSubSlots, 30), "asc");
  }, [freeSubSlots]);

  const earliestStart = useMemo(() => {
    if (!end) return;
    const slot = freeSubSlots.find((slot) =>
      dayjs(end).isBetween(slot.start, slot.end, "ms", "(]")
    );
    return slot?.start;
  }, [end, freeSubSlots]);

  const farthestEnd = useMemo(() => {
    if (!start) return;
    const slot = freeSubSlots.find((slot) =>
      dayjs(start).isBetween(slot.start, slot.end, "ms", "[)")
    );
    return slot?.end;
  }, [freeSubSlots, start]);

  const fromOptions: SelectList<string> = useMemo(() => {
    const all = subslots.map((subslot) => ({
      label: dayjs(subslot.start).format("hh:mm a"),
      value: dayjs(subslot.start).toISOString(),
    }));
    if (!end) return all;
    return all.filter((option) => {
      const value = dayjs(option.value);
      const afterEarliestStart =
        !earliestStart ||
        value.isAfter(earliestStart) ||
        value.isSame(earliestStart);
      return value.isBefore(end) && afterEarliestStart;
    });
  }, [subslots, end, earliestStart]);

  const toOptions: SelectList<string> = useMemo(() => {
    const all = subslots.map((subslot) => ({
      label: dayjs(subslot.end).format("hh:mm a"),
      value: dayjs(subslot.end).toISOString(),
    }));
    if (!start) return all;
    return all.filter((option) => {
      const value = dayjs(option.value);
      const beforeFarthestEnd =
        !farthestEnd ||
        value.isBefore(farthestEnd) ||
        value.isSame(farthestEnd);
      return value.isAfter(start) && beforeFarthestEnd;
    });
  }, [farthestEnd, start, subslots]);

  return (
    <div className="flex items-center gap-6 w-[400px]">
      <div className="flex items-center justify-center gap-4">
        <div className="w-[136px]">
          <Select
            value={start}
            options={fromOptions}
            showDropdownIcon={false}
            placeholder={intl("placeholders.from")}
            onChange={onFromChange}
            disabled={disabled}
          />
        </div>
        <Typography tag="span" className="text-natural-500 text-base font-bold">
          -
        </Typography>
        <div className="w-[136px]">
          <Select
            value={end}
            options={toOptions}
            showDropdownIcon={false}
            placeholder={intl("placeholders.to")}
            onChange={onToChange}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <AnimatePresence initial={false}>
          {remove ? (
            <Animate key="remove">
              <button type="button" onClick={remove}>
                <Close />
              </button>
            </Animate>
          ) : null}

          {add ? (
            <Animate key="add">
              <button type="button" onClick={add}>
                <AddCircle className="w-6 h-6" />
              </button>
            </Animate>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SlotRow;

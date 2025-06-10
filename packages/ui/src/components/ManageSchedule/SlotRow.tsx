import { useFormatMessage } from "@/hooks";
import { IAvailabilitySlot, Void } from "@litespace/types";
import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import Close from "@litespace/assets/Close";
import AddCircleFilled from "@litespace/assets/AddCircle";
import { Typography } from "@/components/Typography";
import { Select, SelectList } from "@/components/Select";
import { motion } from "framer-motion";
import { getSubSlotsBatch, orderSlots } from "@litespace/utils";
import { Button } from "@/components/Button";

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
    <div className="flex items-center gap-1 lg:w-full py-1 ps-2">
      <div className="w-full flex items-center justify-center md:justify-start gap-2">
        <div className="w-full min-w-[76px] lg:min-w-[135px]">
          <Select
            value={start}
            options={fromOptions}
            showDropdownIcon={false}
            placeholder={intl("placeholders.from")}
            onChange={onFromChange}
            disabled={disabled}
            size="medium"
          />
        </div>
        <Typography tag="span" className="text-natural-500 text-base font-bold">
          -
        </Typography>
        <div className="w-full min-w-[76px] lg:min-w-[135px]">
          <Select
            value={end}
            options={toOptions}
            showDropdownIcon={false}
            placeholder={intl("placeholders.to")}
            onChange={onToChange}
            disabled={disabled}
            size="medium"
          />
        </div>
      </div>

      <div className="flex gap-1 lg:gap-2">
        <motion.div style={{ visibility: remove ? "visible" : "hidden" }}>
          <Button
            size="medium"
            variant="secondary"
            type="natural"
            onClick={remove}
            startIcon={<Close className="icon" />}
            disabled={disabled}
          />
        </motion.div>

        <motion.div
          className="flex items-center justify-center"
          style={{ visibility: add ? "visible" : "hidden" }}
        >
          <Button
            size="medium"
            variant="secondary"
            type="natural"
            onClick={add}
            endIcon={<AddCircleFilled className="icon" />}
            disabled={disabled}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SlotRow;

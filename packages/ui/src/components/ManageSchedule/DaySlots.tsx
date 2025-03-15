import SlotRow from "@/components/ManageSchedule/SlotRow";
import { Slot } from "@/components/ManageSchedule/types";
import dayjs from "@/lib/dayjs";
import { subtractSlots } from "@litespace/utils";
import { orUndefined } from "@litespace/utils/utils";
import { IAvailabilitySlot } from "@litespace/types";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { isEmpty } from "lodash";
import React, { useCallback } from "react";

function asSubSlots(slots: Slot[]) {
  const subslots: IAvailabilitySlot.SubSlot[] = [];

  for (const slot of slots) {
    if (!slot.start || !slot.end) continue;
    subslots.push({ parent: slot.id, start: slot.start, end: slot.end });
  }

  return subslots;
}

const Animate: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          duration: 0.5,
          type: "spring",
        },
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

const DaySlots: React.FC<{
  slots: Slot[];
  iso: string;
  disabled?: boolean;
  add: ({
    day,
    start,
    end,
  }: {
    day: string;
    start?: string;
    end?: string;
  }) => void;
  update: ({
    id,
    start,
    end,
  }: {
    id: number;
    start?: string;
    end?: string;
  }) => void;
  remove: (id: number) => void;
}> = ({ slots, iso, disabled, add, update, remove }) => {
  const asFreeSubSlots = useCallback(
    (excludeSlotId?: number) => {
      const start = dayjs(iso).startOf("day");
      const end = start.endOf("day");
      const daySlot: IAvailabilitySlot.Slot = {
        id: 0,
        start: start.toISOString(),
        end: end.toISOString(),
      };

      return subtractSlots(
        daySlot,
        asSubSlots(slots.filter((slot) => slot.id !== excludeSlotId))
      );
    },
    [iso, slots]
  );

  return (
    <div className={cn("flex flex-col gap-2 grow")}>
      <AnimatePresence initial={false}>
        {slots.map((slot, idx) => {
          const last = slots.length - 1 === idx;
          const filled = !!slot.start && !!slot.end;
          const partial = !!slot.start || !!slot.end;
          return (
            <Animate key={idx}>
              <SlotRow
                start={orUndefined(slot.start)}
                end={orUndefined(slot.end)}
                add={last && filled ? () => add({ day: iso }) : undefined}
                remove={partial ? () => remove(slot.id) : undefined}
                onFromChange={(start) => update({ id: slot.id, start })}
                onToChange={(end) => update({ id: slot.id, end })}
                freeSubSlots={asFreeSubSlots(slot.id)}
                disabled={disabled}
              />
            </Animate>
          );
        })}

        {isEmpty(slots) ? (
          <Animate key={0}>
            <SlotRow
              onFromChange={(value: string) => add({ day: iso, start: value })}
              onToChange={(value: string) => add({ day: iso, end: value })}
              freeSubSlots={asFreeSubSlots()}
              disabled={disabled}
            />
          </Animate>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default DaySlots;

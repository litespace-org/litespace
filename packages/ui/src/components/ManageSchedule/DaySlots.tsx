import SlotRow from "@/components/ManageSchedule/SlotRow";
import { Slot } from "@/components/ManageSchedule/types";
import dayjs from "@/lib/dayjs";
import { subtractSlots } from "@litespace/utils";
import { optional } from "@litespace/utils/utils";
import { IAvailabilitySlot } from "@litespace/types";
import cn from "classnames";
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

const DaySlots: React.FC<{
  slots: Slot[];
  iso: string;
  disabled?: boolean;
  add: (payload: { day: string; start?: string; end?: string }) => void;
  update: (payload: { id: number; start?: string; end?: string }) => void;
  remove: (id: number) => void;
}> = ({ slots, iso, disabled, add, update, remove }) => {
  const asFreeSubSlots = useCallback(
    (excludeSlotId?: number) => {
      const start = dayjs(iso).startOf("day");
      const end = start.add(1, "day");
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
      {slots.map((slot, idx) => {
        const last = slots.length - 1 === idx;
        const filled = !!slot.start && !!slot.end;
        const partial = !!slot.start || !!slot.end;
        return (
          <SlotRow
            key={slot.id}
            start={optional(slot.start)}
            end={optional(slot.end)}
            add={last && filled ? () => add({ day: iso }) : undefined}
            remove={partial ? () => remove(slot.id) : undefined}
            onFromChange={(start) => update({ id: slot.id, start })}
            onToChange={(end) => update({ id: slot.id, end })}
            freeSubSlots={asFreeSubSlots(slot.id)}
            disabled={disabled}
          />
        );
      })}

      {isEmpty(slots) ? (
        <SlotRow
          onFromChange={(value: string) => add({ day: iso, start: value })}
          onToChange={(value: string) => add({ day: iso, end: value })}
          freeSubSlots={asFreeSubSlots()}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
};

export default DaySlots;

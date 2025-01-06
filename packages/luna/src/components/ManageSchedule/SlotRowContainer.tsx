import { Slot } from "@/components/ManageSchedule/types";
import { orUndefined } from "@litespace/sol/utils";
import cn from "classnames";
import { concat, isEmpty } from "lodash";
import React, { useCallback } from "react";
import SlotRow from "@/components/ManageSchedule/SlotRow";

function randomSlotId(): number {
  return -Math.floor(Math.random() * 1_000_000);
}

const SlotRowContainer: React.FC<{
  slots: Slot[];
  iso: string;
  setSlots: React.Dispatch<React.SetStateAction<Slot[]>>;
}> = ({ slots, iso, setSlots }) => {
  const addSlot = useCallback(
    ({ day, start, end }: { day: string; start?: string; end?: string }) => {
      setSlots((prev) => {
        const cloned = structuredClone(prev);
        const slot: Slot = {
          id: randomSlotId(),
          start: start || null,
          end: end || null,
          day: day,
          state: "new",
        };
        return concat(cloned, slot);
      });
    },
    [setSlots]
  );

  const removeSlot = useCallback(
    (id: number) => {
      setSlots((prev) => {
        const cloned = structuredClone(prev);
        const filtered = cloned.filter((slot) => slot.id !== id);

        return filtered;
      });
    },
    [setSlots]
  );

  const setSlotDate = useCallback(
    (id: number, start: string, end: string) => {
      setSlots((prev) => {
        const cloned = structuredClone(prev);
        const foundSlot = cloned.find((slot) => slot.id === id);
        if (foundSlot) {
          foundSlot.start = start;
          foundSlot.end = end;
        }
        return cloned;
      });
    },
    [setSlots]
  );

  return (
    <div className={cn("tw-flex tw-flex-col tw-gap-2")}>
      {slots.map((slot, idx) => {
        const isLast = slots.length - 1 === idx;
        const canRemove = slot.start && slot.end;

        return (
          <SlotRow
            key={slot.id}
            start={orUndefined(slot.start)}
            end={orUndefined(slot.end)}
            day={iso}
            add={
              isLast
                ? (start, end) => {
                    addSlot({ day: iso });
                    if (!start || !end) return;
                    setSlotDate(slot.id, start, end);
                  }
                : undefined
            }
            remove={canRemove ? () => removeSlot(slot.id) : undefined}
          />
        );
      })}

      {isEmpty(slots) ? (
        <SlotRow
          day={iso}
          onFromChange={(value: string) => addSlot({ day: iso, start: value })}
          onToChange={(value: string) => addSlot({ day: iso, end: value })}
        />
      ) : null}
    </div>
  );
};

export default SlotRowContainer;

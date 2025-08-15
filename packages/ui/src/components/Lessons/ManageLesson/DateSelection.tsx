import React, { useCallback, useMemo } from "react";
import { range } from "lodash";
import cn from "classnames";
import { Dayjs } from "dayjs";
import { Selectable } from "@/components/Lessons/ManageLesson/Selectable";

const rows = 7;

type DayGrid = Dayjs[];

function getWeekDays(date: Dayjs): DayGrid {
  return range(0, rows).map((day) => {
    return date.add(day, "day");
  });
}

export const DateSelection: React.FC<{
  onSelect: (date: Dayjs) => void;
  isSelectable: (date: Dayjs) => boolean;
  min: Dayjs;
  max: Dayjs;
  selected: Dayjs | null;
  disable?: boolean;
}> = ({ onSelect, isSelectable, selected, min, max, disable }) => {
  const weekDays = useMemo(() => getWeekDays(min), [min]);

  const isOutOfRange = useCallback(
    (date: Dayjs) => date.isBefore(min, "day") || date.isAfter(max, "day"),
    [max, min]
  );

  return (
    <ul className={cn("flex flex-col gap-2 w-full px-4 sm:px-0")}>
      {weekDays.map((day) => {
        const isSelected = !!selected?.isSame(day, "day");

        return (
          <Selectable
            key={day.format("YYYY-MM-DD")}
            disabled={disable || isOutOfRange(day) || !isSelectable(day)}
            isSelected={isSelected}
            name="day"
            onSelect={() => onSelect(day)}
            label={day.format("dddd DD MMMM")}
          />
        );
      })}
    </ul>
  );
};

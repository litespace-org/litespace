import React, { useCallback, useEffect, useMemo, useState } from "react";
import { range } from "lodash";
import cn from "classnames";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import { RadioButton } from "@/components/RadioButton";

const rows = 7;

type DayGrid = Dayjs[];

function getWeekDays(week: Dayjs): DayGrid {
  const startOfWeek = week.startOf("week");
  return range(0, rows).map((day) => {
    return startOfWeek.add(day, "day");
  });
}

export const DateSelection: React.FC<{
  onSelect: (date: Dayjs) => void;
  isSelectable: (date: Dayjs) => boolean;
  min?: Dayjs;
  max?: Dayjs;
  selected: Dayjs | null;
  disable?: boolean;
}> = ({ onSelect, isSelectable, selected, min, max, disable }) => {
  const value = useMemo(() => selected || dayjs(), [selected]);
  const [date, setDate] = useState<Dayjs>(value.startOf("week"));

  console.log({ date: date.toISOString() });
  console.log({ day: dayjs().toISOString() });

  const today = useMemo(() => dayjs(), []);
  const weekDays = useMemo(() => getWeekDays(date), [date]);

  useEffect(() => {
    if (selected) setDate(selected.startOf("week"));
  }, [selected]);

  const isOutOfRange = useCallback(
    (date: Dayjs) =>
      (min && date.isBefore(min, "day")) || (max && date.isAfter(max, "day")),
    [max, min]
  );

  return (
    <div className="px-4 md:px-0 flex flex-col gap-6 items-center text-foreground relative">
      <ul className={cn("flex flex-col gap-2 w-full")}>
        {weekDays.map((day) => {
          const isCurrentMonth = day.isSame(date, "month");
          const isSelected = selected?.isSame(day, "day");
          const selectable = isSelectable(day);
          return (
            <button
              key={day.format("YYYY-MM-DD")}
              disabled={disable || isOutOfRange(day) || !isSelectable(day)}
              data-selected={isSelected}
              className={cn(
                "p-2 flex items-center gap-2",
                "cursor-pointer disabled:cursor-not-allowed",
                "text-center w-full border border-natural-900 shadow-date-selection-item rounded-lg",
                isCurrentMonth &&
                  "data-[selected=false]:hover:bg-brand-100 active:bg-brand-700 data-[selected=true]:bg-brand-700",
                today.isSame(day, "day") && "ring ring-surface-300",
                (!isCurrentMonth || !selectable) && "opacity-20"
              )}
              onClick={() => onSelect(day)}
              type="button"
            >
              <RadioButton checked={isSelected} disabled={!selectable} />
              <Typography tag="p">{day.format("dddd DD MMMM")}</Typography>
            </button>
          );
        })}
      </ul>
    </div>
  );
};

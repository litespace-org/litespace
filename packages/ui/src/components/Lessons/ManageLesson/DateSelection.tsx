import React, { useCallback, useEffect, useMemo, useState } from "react";
import { flatten, range } from "lodash";
import cn from "classnames";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import { Typography } from "@/components/Typography";

const rows = 6;
const cols = 7;

type DayGrid = Dayjs[];

function makeDayGrid(month: Dayjs): DayGrid {
  return flatten(
    range(0, rows).map((week) => {
      const start = month.add(week, "weeks").startOf("week");
      return range(0, cols).map((day) => start.add(day, "days"));
    })
  );
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
  const [date, setDate] = useState<Dayjs>(value.startOf("month"));
  const year = useMemo(() => date.get("year"), [date]);
  const today = useMemo(() => dayjs(), []);
  const grid = useMemo(() => makeDayGrid(date), [date]);

  useEffect(() => {
    if (selected) setDate(selected.startOf("month"));
  }, [selected]);

  const nextMonth = useCallback(() => {
    setDate(date.add(1, "month"));
  }, [date]);

  const prevMonth = useCallback(() => {
    setDate(date.subtract(1, "month"));
  }, [date]);

  const isOutOfRange = useCallback(
    (date: Dayjs) =>
      (min && date.isBefore(min, "day")) || (max && date.isAfter(max, "day")),
    [max, min]
  );

  const canGoBack = useMemo(() => {
    const next = date.subtract(1, "month");
    return !min || (min && next.date(next.daysInMonth()).isAfter(min));
  }, [date, min]);

  const canGoNext = useMemo(() => {
    return !max || (max && date.add(1, "month").date(1).isBefore(max));
  }, [date, max]);

  return (
    <div className="flex flex-col items-center text-foreground relative">
      <div
        className={cn("flex flex-row items-center justify-between mb-5 gap-4")}
      >
        <button
          type="button"
          disabled={!canGoBack || disable}
          onClick={prevMonth}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="[&>*]:stroke-brand-700" />
        </button>
        <Typography
          tag="span"
          className="flex items-center justify-center text-center text-natural-950 font-medium text-subtitle-2"
        >
          {date.format("MMMM")} {year}
        </Typography>
        <button
          type="button"
          disabled={!canGoNext || disable}
          onClick={nextMonth}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="[&>*]:stroke-brand-700" />
        </button>
      </div>

      <ul className={cn("grid grid-cols-7 gap-4")}>
        {grid.map((day) => {
          const isCurrentMonth = day.isSame(date, "month");
          const isSelected = selected?.isSame(day, "day");
          const selectable = isSelectable(day);
          return (
            <button
              key={day.format("YYYY-MM-DD")}
              disabled={disable || isOutOfRange(day) || !isSelectable(day)}
              data-selected={isSelected}
              className={cn(
                "flex flex-col items-center justify-center gap-[7px]",
                "cursor-pointer disabled:cursor-not-allowed",
                "text-center w-[60px] h-[60px] border border-natural-900 shadow-date-selection-item rounded-lg",
                isCurrentMonth &&
                  "data-[selected=false]:hover:bg-brand-100 active:bg-brand-700 data-[selected=true]:bg-brand-700",
                today.isSame(day, "day") && "ring ring-surface-300",
                (!isCurrentMonth || !selectable) && "opacity-20"
              )}
              onClick={() => onSelect(day)}
              type="button"
            >
              <Typography
                tag="span"
                data-selected={isSelected}
                className="text-natural-950 data-[selected=true]:text-natural-50 text-tiny"
              >
                {day.format("DD")}
              </Typography>
              <Typography
                tag="span"
                data-selected={isSelected}
                className="text-natural-950 data-[selected=true]:text-natural-50 text-tiny"
              >
                {day.format("dddd")}
              </Typography>
            </button>
          );
        })}
      </ul>
    </div>
  );
};

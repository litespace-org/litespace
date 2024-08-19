import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { ChevronRight, ChevronLeft } from "react-feather";
import { flatten, range } from "lodash";
import { days } from "@/constants/labels";
import cn from "classnames";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";

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

export const DatePicker: React.FC<{
  onSelect?: (date: Dayjs) => void;
  min?: Dayjs;
  max?: Dayjs;
  selected?: Dayjs;
  disable?: boolean;
  compact?: boolean;
  today?: string;
}> = ({
  onSelect,
  selected,
  min,
  max,
  disable,
  compact,
  today: todayLabel,
}) => {
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

  const reset = useCallback(() => {
    setDate(today.startOf("month"));
    if (onSelect) onSelect(today);
  }, []);

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
        className={cn(
          "flex flex-row items-center justify-between mb-5",
          compact ? "gap-2 text-xs" : "gap-10 w-[300px] "
        )}
      >
        <div>
          <Button
            htmlType="button"
            disabled={!canGoNext || disable}
            onClick={nextMonth}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
            className={cn(compact ? "!p-1 !h-auto" : "")}
          >
            <ChevronRight className={cn(compact && "w-[15px] h-[15px]")} />
          </Button>
        </div>
        <p className="flex-1 flex items-center justify-center text-center">
          {date.format("MMMM")} {year}
        </p>
        <div>
          <Button
            htmlType="button"
            disabled={!canGoBack || disable}
            onClick={prevMonth}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
            className={cn(compact && "!p-1 !h-auto")}
          >
            <ChevronLeft className={cn(compact && "w-[15px] h-[15px]")} />
          </Button>
        </div>
        <div className="absolute top-0 right-1">
          <Button
            onClick={reset}
            size={ButtonSize.Tiny}
            type={ButtonType.Secondary}
            className={cn(compact && "!p-1 !h-[25px] text-xs")}
            disabled={disable}
          >
            {todayLabel}
          </Button>
        </div>
      </div>

      <ul className={cn("grid grid-cols-7", compact ? "gap-1.5" : "gap-4")}>
        {days.map((day) => (
          <li
            key={day}
            className={cn("text-center", compact ? "text-xs" : "text-sm")}
          >
            {day}
          </li>
        ))}

        {grid.map((day) => {
          const isCurrentMonth = day.isSame(date, "month");
          return (
            <Button
              key={day.format("YYYY-MM-DD")}
              disabled={
                (min && day.isBefore(min, "day")) ||
                (max && day.isAfter(max, "day")) ||
                disable
              }
              className={cn(
                "text-center relative",
                today.isSame(day, "day") && "ring ring-surface-300",
                compact && "!p-1 !h-auto",
                !isCurrentMonth && "opacity-40"
              )}
              type={
                selected && selected.isSame(day, "day")
                  ? ButtonType.Primary
                  : ButtonType.Secondary
              }
              size={ButtonSize.Small}
              onClick={() => onSelect && onSelect(day)}
              htmlType="button"
            >
              {day.get("date")}
            </Button>
          );
        })}
      </ul>
    </div>
  );
};

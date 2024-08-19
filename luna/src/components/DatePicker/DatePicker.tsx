import React, { useCallback, useMemo, useState } from "react";
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
}> = ({ onSelect, selected, min, max, disable }) => {
  const value = useMemo(() => selected || dayjs(), [selected]);
  const [date, setDate] = useState<Dayjs>(value.startOf("month"));
  const year = useMemo(() => date.get("year"), [date]);
  const today = useMemo(() => dayjs(), []);
  const grid = useMemo(() => makeDayGrid(date), [date]);

  const nextMonth = useCallback(() => {
    setDate(date.add(1, "month"));
  }, [date]);

  const prevMonth = useCallback(() => {
    setDate(date.subtract(1, "month"));
  }, [date]);

  const canGoBack = useMemo(() => {
    const next = date.subtract(1, "month");
    return !min || (min && next.date(next.daysInMonth()).isAfter(min));
  }, [date, min]);

  const canGoNext = useMemo(() => {
    return !max || (max && date.add(1, "month").date(1).isBefore(max));
  }, [date, max]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center justify-between gap-10 w-[300px] mb-5">
        <div>
          <Button
            htmlType="button"
            disabled={!canGoNext || disable}
            onClick={nextMonth}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
          >
            <ChevronRight />
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
          >
            <ChevronLeft />
          </Button>
        </div>
      </div>

      <ul className="grid grid-cols-7 gap-4">
        {days.map((day) => (
          <li key={day} className="text-sm text-center">
            {day}
          </li>
        ))}

        {grid.map((day) => {
          return (
            <Button
              disabled={
                (min && day.isBefore(min, "day")) ||
                (max && day.isAfter(max, "day")) ||
                disable
              }
              className={cn(
                "text-center relative",
                today.isSame(day, "day") && "ring ring-surface-300"
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

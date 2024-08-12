import React, { useCallback, useMemo, useState } from "react";
import ar from "@/locales/ar-eg.json";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { ChevronRight, ChevronLeft } from "react-feather";
import { concat, flatten, range } from "lodash";
import cn from "classnames";
import dayjs, { Dayjs } from "dayjs";
import { padStart } from "lodash";

/**
 * Facts:
 * 1. Sun has index of "0"
 * 2. Jun has index of "0"
 * 3. First day of the month is "1" not "0"
 */

function dayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month, day).getDay();
}

function asWeekDayShiftedIndex(index: number): number {
  return index === 6 ? 0 : index + 1;
}

function pad<T>(
  values: T[],
  length: number,
  value: T,
  start: boolean = true
): T[] {
  if (values.length === length) return values;
  const remaining = length - values.length;
  const padding = new Array(remaining).fill(value);
  if (start) return concat(padding, values);
  return concat(values, padding);
}

const days = [
  ar["global.days.sat"],
  ar["global.days.sun"],
  ar["global.days.mon"],
  ar["global.days.tue"],
  ar["global.days.wed"],
  ar["global.days.thu"],
  ar["global.days.fri"],
] as const;

const months = [
  ar["global.months.january"],
  ar["global.months.february"],
  ar["global.months.march"],
  ar["global.months.april"],
  ar["global.months.may"],
  ar["global.months.june"],
  ar["global.months.july"],
  ar["global.months.august"],
  ar["global.months.september"],
  ar["global.months.october"],
  ar["global.months.november"],
  ar["global.months.december"],
] as const;

const rows = 6;
const cols = 7;
const cellCount = rows * cols;

type DayGrid = Array<number>;

function makeDaysGrid({
  daysInMonth,
  year,
  month,
}: {
  daysInMonth: number;
  year: number;
  month: number;
}): DayGrid {
  const days = range(1, daysInMonth + 1).map((day) => {
    const weekDay = dayOfWeek(year, month, day);
    return {
      dayOfWeek: weekDay,
      weekDayShiftedIndex: asWeekDayShiftedIndex(weekDay),
      dayOfMonth: day,
    };
  });

  const weeks: Array<number[]> = [];
  let weekIndex = 0;

  for (const day of days) {
    if (!weeks[weekIndex]) weeks[weekIndex] = [];
    weeks[weekIndex].push(day.dayOfMonth);

    if (
      day.weekDayShiftedIndex === 0 &&
      weekIndex === 0 &&
      weeks[weekIndex].length === 1
    )
      continue;
    if (day.weekDayShiftedIndex === 6) weekIndex += 1;
  }

  const grid = flatten(weeks.map((week, idx) => pad(week, 7, 0, idx === 0)));
  return pad(grid, cellCount, 0, false);
}

export const DatePicker: React.FC<{
  onSelect?: (date: Dayjs) => void;
  selected?: Dayjs;
}> = ({ onSelect, selected }) => {
  const [date, setDate] = useState<Dayjs>(selected || dayjs());
  const month = useMemo(() => date.get("month"), [date]);
  const monthText = useMemo(() => months[month], [month]);
  const year = useMemo(() => date.get("year"), [date]);
  const today = useMemo(() => dayjs(), []);
  const dayGrid = useMemo(
    () => makeDaysGrid({ daysInMonth: date.daysInMonth(), year, month }),
    [date, month, year]
  );

  const nextMonth = useCallback(() => {
    setDate(date.add(1, "month"));
  }, [date]);

  const prevMonth = useCallback(() => {
    setDate(date.subtract(1, "month"));
  }, [date]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center justify-between gap-10 w-[300px] mb-5">
        <div>
          <Button
            onClick={nextMonth}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
          >
            <ChevronRight />
          </Button>
        </div>
        <p className="flex-1 flex items-center justify-center text-center">
          {monthText} {year}
        </p>
        <div>
          <Button
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

        {dayGrid.map((day, idx) => {
          const dayDate = dayjs(
            [
              year,
              padStart((month + 1).toString(), 2, "0"),
              padStart(day.toString(), 2, "0"),
            ].join("/"),
            "YYYY-MM-DD"
          );

          return (
            <Button
              disabled={day === 0}
              className={cn(
                "text-center relative",
                today.isSame(dayDate, "day") && "ring ring-surface-300"
              )}
              type={
                selected && selected.isSame(dayDate, "day") && day !== 0
                  ? ButtonType.Primary
                  : ButtonType.Secondary
              }
              size={ButtonSize.Small}
              key={idx}
              onClick={() => onSelect && onSelect(dayDate)}
            >
              {day || "-"}
            </Button>
          );
        })}
      </ul>
    </div>
  );
};

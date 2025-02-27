import React, { useEffect, useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { first, range, reverse } from "lodash";
import { Tooltip } from "@/components/Tooltip";
import {
  ActivityMap,
  FullGrid,
  GridDay,
} from "@/components/ActivityGrid/types";
import cn from "classnames";
import { Card } from "@/components/Card";

const DAYS_OF_WEEK = 7;
const WEEKS_OF_YEAR = 52;

export const ActivityGrid = <T,>({
  map,
  tooltip,
  start,
}: {
  map: ActivityMap<T>;
  tooltip: (day: GridDay<T>) => React.ReactNode;
  start?: Dayjs;
}): React.ReactNode => {
  const [today, setToday] = useState(dayjs().startOf("day"));

  useEffect(() => {
    if (start) setToday(start.startOf("day"));
  }, [start]);

  const grid = useMemo(() => {
    const weekRange = range(0, WEEKS_OF_YEAR);
    const weeks: FullGrid<T> = [];
    for (const week of weekRange) {
      const startOfWeek = today.subtract(week, "weeks").startOf("week");
      const weekDayRange = range(0, DAYS_OF_WEEK);
      const weekDays: GridDay<T>[] = [];
      for (const day of weekDayRange) {
        const dayOfWeek = startOfWeek.add(day, "days").startOf("day");
        const include = dayOfWeek.isBefore(today) || dayOfWeek.isSame(today);
        if (include)
          weekDays.push({
            date: dayOfWeek,
            value: map[dayOfWeek.format("YYYY-MM-DD")] || null,
          });
      }
      weeks.push(weekDays);
    }

    return reverse(weeks);
  }, [map, today]);

  return (
    <Card className={cn("!p-0 px-1")}>
      <div
        className={cn(
          "overflow-x-auto pt-9 pb-5 pr-4",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        )}
      >
        <ul className="flex flex-row gap-1 w-fit">
          {grid.map((week, idx) => {
            const current = first(week)?.date;
            const previous = first(grid[idx - 1])?.date;
            const next = first(grid[idx + 1])?.date;
            const anotherMonth =
              (current && previous && current.month() !== previous.month()) ||
              (current && !previous)
                ? current.format("MMM")
                : null;

            const start = current && !previous && next;
            const end = current && previous && !next;
            const middle = current && previous && next;

            return (
              <li className="relative" key={idx}>
                {anotherMonth ? (
                  <span
                    className={cn("absolute text-tiny -top-6", {
                      "left-1/2 -translate-x-1/2": middle,
                      "right-0": start,
                      "left-0": end,
                    })}
                  >
                    {anotherMonth}
                  </span>
                ) : null}
                <ul className="flex flex-col gap-1">
                  {week.map((day) => {
                    const score = day.value?.score || 0;
                    return (
                      <Tooltip
                        key={day.date.toISOString()}
                        content={tooltip(day)}
                      >
                        <li
                          className={cn("w-[12px] h-[12px] rounded-sm", {
                            "bg-background-selection border border-border-control":
                              score === 0,
                            "bg-calendar-day-level-1 border border-calendar-day-border-level-1":
                              score === 1,
                            "bg-calendar-day-level-2 border border-calendar-day-border-level-2":
                              score === 2,
                            "bg-calendar-day-level-3 border border-calendar-day-border-level-3":
                              score === 3,
                            "bg-calendar-day-level-4 border border-calendar-day-border-level-4":
                              score >= 4,
                          })}
                        />
                      </Tooltip>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};

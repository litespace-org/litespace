import React, { useCallback, useMemo, useState } from "react";
import { days, months } from "@/constants/labels";
import { Dayjs } from "dayjs";
import { Button, ButtonSize, ButtonType } from "../Button";
import { ChevronLeft, ChevronRight } from "react-feather";
import cn from "classnames";
import { DAYS_OF_WEEK, HOURS_OF_DAY } from "@/constants/number";
import { IEvent } from "@/components/Calendar/types";
import Event from "@/components/Calendar/Event";
import dayjs from "@/lib/dayjs";

function makeWeekHours() {
  const week: Array<Array<number>> = [];
  for (let dayIndex = 0; dayIndex < DAYS_OF_WEEK; dayIndex++) {
    const day: number[] = [];
    for (let hourIndex = 0; hourIndex < HOURS_OF_DAY; hourIndex++) {
      day.push(hourIndex);
    }
    week.push(day);
  }

  return week;
}

function makeDayHours(): Dayjs[] {
  const day = dayjs().startOf("day");
  const hours: Dayjs[] = [];

  for (let hour = 0; hour < HOURS_OF_DAY; hour++) {
    hours.push(day.add(hour, "hour"));
  }

  return hours;
}

const events: IEvent[] = [
  { start: "2024-08-18T09:00:00.000Z", end: "2024-08-18T10:00:00.000Z" },
  { start: "2024-08-18T10:00:00.000Z", end: "2024-08-18T11:00:00.000Z" },
  { start: "2024-08-18T12:30:00.000Z", end: "2024-08-18T13:30:00.000Z" },
  { start: "2024-08-19T09:00:00.000Z", end: "2024-08-19T10:00:00.000Z" },
  { start: "2024-08-19T12:30:00.000Z", end: "2024-08-19T13:30:00.000Z" },
  { start: "2024-08-21T08:00:00.000Z", end: "2024-08-21T13:30:00.000Z" },
];

export const Calendar: React.FC<{
  disabled?: boolean;
}> = ({ disabled }) => {
  const [date, setDate] = useState(dayjs().startOf("week"));
  const month = useMemo(() => date.get("month"), [date]);
  const monthText = useMemo(() => months[month], [month]);
  const year = useMemo(() => date.get("year"), [date]);
  const today = useMemo(() => dayjs().startOf("day"), []);
  const dayHours = useMemo(() => makeDayHours(), []);

  const grid = useMemo(() => {
    return makeWeekHours();
  }, []);

  const nextWeek = useCallback(() => {
    setDate(date.add(1, "week"));
  }, [date]);

  const prevWeek = useCallback(() => {
    setDate(date.subtract(1, "week"));
  }, [date]);

  const weekEvents = useMemo(() => {
    return events.filter((event) => {
      const eventStart = dayjs(event.start);
      const eventEnd = dayjs(event.end);
      const weekStart = date;
      const weekEnd = date.add(1, "week");

      // event already ended
      if (
        eventEnd.isBefore(weekStart, "days") ||
        eventEnd.isSame(weekStart, "days")
      )
        return false;

      // event didn't start yet
      if (
        eventStart.isAfter(weekEnd, "days") ||
        eventStart.isSame(weekEnd, "days")
      )
        return false;

      // event intersects with the current hour
      return true;
    });
  }, [date]);

  return (
    <div>
      <div className="border-b border-border-strong p-4 flex justify-start items-center gap-4">
        <div className="flex flex-row gap-4">
          <Button
            disabled={disabled}
            onClick={nextWeek}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
          >
            <ChevronRight />
          </Button>
          <Button
            disabled={disabled}
            onClick={prevWeek}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
          >
            <ChevronLeft />
          </Button>
        </div>
        <p>
          {monthText} {year}
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <ul className="flex flex-row flex-1 items-center w-full">
          <li className="w-[48px] min-w-[48px] h-[96px] border-l border-border-strong bg-surface-100" />
          {days.map((day, idx) => {
            const dayDate = date.add(idx, "day");
            const isToday = dayDate.isSame(today, "day");
            return (
              <li
                key={day}
                className={cn(
                  "flex flex-col justify-center items-center gap-1",
                  "w-[250px] min-w-[250px] border-l border-border-strong py-4 bg-surface-100"
                )}
              >
                <p className={cn("text-sm")}>{day}</p>
                <p
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-xl",
                    isToday ? "bg-selection" : "bg-transparent"
                  )}
                >
                  {dayDate.get("date")}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center relative">
          <ul className="w-[48px]">
            {dayHours.map((hour) => {
              return (
                <li
                  key={hour.toDate().toISOString()}
                  className="h-[80px] w-[48px] text-center text-xs"
                >
                  {hour.format("h a")}
                </li>
              );
            })}
          </ul>
          <div className="flex items-center w-full relative">
            {grid.map((day, dayIndex) => {
              return (
                <ul key={`d-${dayIndex}`}>
                  {day.map((hour) => {
                    const time = date
                      .add(dayIndex, "day")
                      .add(hour, "hour")
                      .locale("en")
                      .format("YYYY-MM-DD hh:mm a");
                    return (
                      <li
                        data-time={time}
                        key={time}
                        className="h-[80px] w-[250px] border border-muted relative"
                      />
                    );
                  })}
                </ul>
              );
            })}

            {weekEvents.map((event) => (
              <Event key={event.start} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

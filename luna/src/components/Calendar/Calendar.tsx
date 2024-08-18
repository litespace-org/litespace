import React, { useCallback, useMemo, useState } from "react";
import { days } from "@/constants/labels";
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

function isWrapped(target: IEvent, events: IEvent[]): boolean {
  const filtered = events.filter((event) => event.id !== target.id);

  for (const event of filtered) {
    const targetStart = dayjs(target.start);
    const eventStart = dayjs(event.start);
    const eventEnd = dayjs(event.end);

    if (targetStart.isBetween(eventStart, eventEnd, "minutes", "[)"))
      return true;
  }

  return false;
}

function isWrapper(target: IEvent, events: IEvent[]): boolean {
  const filtered = events.filter((event) => event.id !== target.id);

  for (const event of filtered) {
    const eventStart = dayjs(event.start);
    const targetStart = dayjs(target.start);
    const targetEnd = dayjs(target.end);

    if (eventStart.isBetween(targetStart, targetEnd, "minutes", "[)"))
      return true;
  }

  return false;
}

export const Calendar: React.FC<{
  disabled?: boolean;
  events?: IEvent[];
}> = ({ disabled, events = [] }) => {
  const [date, setDate] = useState(dayjs().startOf("week"));
  const year = useMemo(() => date.get("year"), [date]);
  const today = useMemo(() => dayjs().startOf("day"), []);
  const dayHours = useMemo(() => makeDayHours(), []);
  const weekHours = useMemo(() => makeWeekHours(), []);

  const nextWeek = useCallback(() => {
    setDate(date.add(1, "week"));
  }, [date]);

  const prevWeek = useCallback(() => {
    setDate(date.subtract(1, "week"));
  }, [date]);

  const weekEvents = useMemo(() => {
    return events.filter((event) => {
      const start = date;
      const end = date.add(1, "week");
      return dayjs(event.start).isBetween(start, end, "day", "[]");
    });
  }, [date, events]);

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-center overflow-x-auto",
        "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
      )}
    >
      <div className="p-4 flex justify-start items-center gap-4">
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
          {date.format("MMMM")} {year}
        </p>
      </div>
      <div
        className={cn(
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        )}
      >
        <ul className="flex flex-row flex-1 items-center w-full">
          <li className="w-[48px] min-w-[48px] h-[96px] border-l border-t border-border-strong bg-surface-100 border-b" />
          {days.map((day, idx) => {
            const dayDate = date.add(idx, "day");
            const isToday = dayDate.isSame(today, "day");
            return (
              <li
                key={day}
                className={cn(
                  "flex flex-col justify-center items-center gap-1",
                  "w-[250px] min-w-[250px] h-[96px] border-l border-t border-border-strong bg-surface-100 border-b"
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
            {weekHours.map((day, dayIndex) => {
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

            {weekEvents.map((event, idx) => (
              <Event
                key={event.start + event.end + idx}
                event={event}
                wrapper={isWrapper(event, events)}
                wrapped={isWrapped(event, events)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

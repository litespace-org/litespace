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
      className={cn("w-full h-full flex flex-col items-start justify-center")}
    >
      <div className="py-4  flex justify-start items-center gap-4">
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
          "overflow-auto w-full",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        )}
      >
        <ul className="flex flex-row flex-1 items-center w-full">
          <li
            className={cn(
              "border-l border-t border-border-strong bg-surface-100 border-b",
              "w-[40px] min-w-[40px] 2xl:w-[70px] 2xl:min-w-[70px] h-[50px]",
              "sm:h-[60px] md:h-[60px] lg:h-[80px] 2xl:h-[90px]"
            )}
          />
          {days.map((day, idx) => {
            const dayDate = date.add(idx, "day");
            const isToday = dayDate.isSame(today, "day");
            return (
              <li
                key={day}
                className={cn(
                  "flex flex-col justify-center items-center gap-1",
                  "w-[70px] h-[50px] p-1",
                  "sm:w-[80px] sm:min-w-[80px] sm:h-[60px]",
                  "md:w-[100px] md:min-w-[100px] md:h-[60px]",
                  "lg:w-[130px] lg:min-w-[130px] lg:h-[80px]",
                  "xl:w-[170px] xl:min-w-[170px] xl:h-[80px]",
                  "2xl:w-[205px] 2xl:min-w-[205px] 2xl:h-[90px]",
                  "border-l border-t border-border-strong bg-surface-100 border-b"
                )}
              >
                <p className={cn("text-xs md:!text-base")}>{day}</p>
                <p
                  className={cn(
                    "w-5 h-5 md:w-7 md:h-7 lg:h-10 lg:w-10 rounded-full flex items-center justify-center text-xs md:!text-base lg:!text-lg",
                    isToday ? "bg-selection" : "bg-transparent"
                  )}
                >
                  {dayDate.get("date")}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="flex items-start relative">
          <ul className="w-[40px] 2xl:w-[70px]">
            {dayHours.map((hour) => {
              return (
                <li
                  key={hour.toDate().toISOString()}
                  className={cn(
                    "h-[50px] w-[40px] 2xl:w-[70px] text-center text-xs p-1",
                    "sm:h-[60px] md:h-[90px] lg:h-[90px]"
                  )}
                >
                  {hour.format("h a")}
                </li>
              );
            })}
          </ul>
          <div className="flex items-start w-full relative">
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
                        className={cn(
                          "border border-muted relative",
                          "w-[70px] h-[50px]",
                          "sm:w-[80px] sm:h-[60px]",
                          "md:w-[100px] md:h-[90px]",
                          "lg:w-[130px] md:h-[90px]",
                          "xl:w-[170px] md:h-[90px]",
                          "2xl:w-[205px] 2xl:h-[90px]"
                        )}
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

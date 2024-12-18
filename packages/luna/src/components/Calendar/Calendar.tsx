import React, { useCallback, useEffect, useMemo, useState } from "react";
import { days } from "@/constants/labels";
import { Dayjs } from "dayjs";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@/components/Button";
import { ChevronLeft, ChevronRight, RotateCcw } from "react-feather";
import cn from "classnames";
import { DAYS_OF_WEEK, HOURS_OF_DAY } from "@/constants/number";
import { IEvent } from "@/components/Calendar/types";
import Event from "@/components/Calendar/Event";
import dayjs from "@/lib/dayjs";
import { useMediaQueries } from "@/hooks/media";
import Overlay from "@/components/Calendar/Overlay";
import Indicator from "@/components/Calendar/Indicator";

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

export const Calendar: React.FC<{
  disabled?: boolean;
  events?: IEvent[];
  loading?: boolean;
  className?: string;
  start?: string;
  min?: string;
  max?: string;
  onNextWeek?: (day: Dayjs) => void;
  onPrevWeek?: (day: Dayjs) => void;
  onNextMonth?: (day: Dayjs) => void;
  onPrevMonth?: (day: Dayjs) => void;
}> = ({
  min,
  max,
  start,
  loading,
  disabled,
  className,
  events = [],
  onNextWeek,
  onPrevWeek,
  onNextMonth,
  onPrevMonth,
}) => {
  const currentWeek = useMemo(
    () => (start ? dayjs(start).startOf("week") : dayjs().startOf("week")),
    [start]
  );
  const [date, setDate] = useState(currentWeek);
  const year = useMemo(() => date.get("year"), [date]);
  const today = useMemo(() => dayjs().startOf("day"), []);
  const dayHours = useMemo(() => makeDayHours(), []);
  const weekHours = useMemo(() => makeWeekHours(), []);
  const { xl } = useMediaQueries();

  useEffect(() => {
    setDate(dayjs(start).startOf("week"));
  }, [start]);

  const canGoNext = useMemo(() => {
    const next = date.add(1, "week");
    return !max || next.isSame(max, "day") || next.isBefore(max, "day");
  }, [date, max]);

  const canGoBack = useMemo(() => {
    const prev = date.subtract(1, "week");
    return !min || prev.isSame(min, "day") || prev.isAfter(min, "day");
  }, [date, min]);

  const canGoStartOfCurrentWeek = useMemo(() => {
    return (
      (!min ||
        currentWeek.isSame(min, "day") ||
        currentWeek.isAfter(min, "day")) &&
      (!max ||
        currentWeek.isSame(max, "day") ||
        currentWeek.isBefore(max, "day")) &&
      !date.isSame(currentWeek)
    );
  }, [currentWeek, date, max, min]);

  const nextWeek = useCallback(() => {
    const week = date.add(1, "week");
    const start = week.subtract(1, "minute");
    const end = week.add(1, "week").subtract(1, "minute");
    setDate(week);
    if (onNextWeek) onNextWeek(week);
    if (start.month() !== end.month() && onNextMonth)
      onNextMonth(end.startOf("month"));
  }, [date, onNextMonth, onNextWeek]);

  const prevWeek = useCallback(() => {
    const prev = date;
    const week = date.subtract(1, "week");
    const start = prev.add(1, "minute");
    const end = week.add(1, "minute");
    setDate(week);
    if (onPrevWeek) onPrevWeek(week);
    if (start.month() !== end.month() && onPrevMonth)
      onPrevMonth(end.startOf("month"));
  }, [date, onPrevMonth, onPrevWeek]);

  const weekEvents = useMemo(() => {
    return events.filter((event) => {
      const start = date;
      const end = date.add(1, "week");
      return dayjs(event.start).isBetween(start, end, "minutes", "[]");
    });
  }, [date, events]);

  const startOfCurrentWeek = useCallback(
    () => setDate(currentWeek),
    [currentWeek]
  );

  return (
    <div className="tw-flex tw-flex-col">
      <div className="tw-py-4 tw-flex tw-justify-start tw-items-center tw-gap-4">
        <div className="tw-flex tw-items-center tw-justify-center tw-flex-row tw-gap-4">
          <Button
            disabled={disabled || loading || !canGoStartOfCurrentWeek}
            onClick={startOfCurrentWeek}
            size={xl ? ButtonSize.Small : ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
          >
            <RotateCcw className="tw-w-[15px] tw-h-[15px] xl:tw-w-[20px] xl:tw-h-[20px]" />
          </Button>
          <Button
            disabled={disabled || loading || !canGoBack}
            onClick={prevWeek}
            size={xl ? ButtonSize.Small : ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
          >
            <ChevronRight className="tw-w-[15px] tw-h-[15px] xl:tw-w-[20px] xl:tw-h-[20px]" />
          </Button>
          <Button
            disabled={disabled || loading || !canGoNext}
            onClick={nextWeek}
            size={xl ? ButtonSize.Small : ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
          >
            <ChevronLeft className="tw-w-[15px] tw-h-[15px] xl:tw-w-[20px] xl:tw-h-[20px]" />
          </Button>
        </div>
        <p className="tw-text-sm xl:tw-text-base">
          {date.format("MMMM")} {year}
        </p>
      </div>
      <div
        className={cn(
          "tw-overflow-auto tw-w-fit tw-relative",
          "tw-scrollbar-thin tw-scrollbar-thumb-border-stronger tw-scrollbar-track-surface-300",
          loading && "tw-opacity-70",
          className
        )}
      >
        {loading ? <Overlay /> : null}
        <ul className="tw-flex tw-flex-row tw-flex-1 tw-items-center tw-w-fit">
          <li
            className={cn(
              "tw-border-l tw-border-t tw-border-border-strong tw-bg-surface-100 tw-border-b",
              "tw-w-[40px] tw-min-w-[40px] 2xl:tw-w-[70px] 2xl:tw-min-w-[70px] tw-h-[50px]",
              "sm:tw-h-[60px] md:tw-h-[60px] lg:tw-h-[80px] 2xl:tw-h-[90px]"
            )}
          />
          {days.map((day, idx) => {
            const dayDate = date.add(idx, "day");
            const isToday = dayDate.isSame(today, "day");
            return (
              <li
                key={day}
                className={cn(
                  "tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-1",
                  "tw-w-[70px] tw-h-[50px] tw-p-1",
                  "sm:tw-w-[80px] sm:tw-min-w-[80px] sm:tw-h-[60px]",
                  "md:tw-w-[100px] md:tw-min-w-[100px] md:tw-h-[60px]",
                  "lg:tw-w-[130px] lg:tw-min-w-[130px] lg:tw-h-[80px]",
                  "xl:tw-w-[170px] xl:tw-min-w-[170px] xl:tw-h-[80px]",
                  "2xl:tw-w-[205px] 2xl:tw-min-w-[205px] 2xl:tw-h-[90px]",
                  "tw-border-l tw-border-t tw-border-border-strong tw-bg-surface-100 tw-border-b"
                )}
              >
                <p className={cn("tw-text-xs md:!tw-text-base")}>{day}</p>
                <p
                  className={cn(
                    "tw-w-5 tw-h-5 md:tw-w-7 md:tw-h-7 lg:tw-h-10 lg:tw-w-10",
                    "tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-xs md:!tw-text-base lg:!tw-text-lg",
                    isToday ? "tw-bg-selection" : "tw-bg-transparent"
                  )}
                >
                  {dayDate.get("date")}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="tw-flex tw-items-start tw-relative">
          <ul className="tw-w-[40px] 2xl:tw-w-[70px]">
            {dayHours.map((hour) => {
              return (
                <li
                  key={hour.toDate().toISOString()}
                  className={cn(
                    "tw-h-[50px] tw-w-[40px] 2xl:tw-w-[70px] tw-text-center tw-text-xs tw-p-1",
                    "sm:tw-h-[60px] md:tw-h-[90px] lg:tw-h-[90px]"
                  )}
                >
                  {hour.format("h a")}
                </li>
              );
            })}
          </ul>
          <div className="tw-flex tw-items-start tw-w-full tw-relative">
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
                          "tw-border tw-border-muted tw-relative",
                          "tw-w-[70px] tw-h-[50px]",
                          "sm:tw-w-[80px] sm:tw-h-[60px]",
                          "md:tw-w-[100px] md:tw-h-[90px]",
                          "lg:tw-w-[130px] md:tw-h-[90px]",
                          "xl:tw-w-[170px] md:tw-h-[90px]",
                          "2xl:tw-w-[205px] 2xl:tw-h-[90px]"
                        )}
                      />
                    );
                  })}
                </ul>
              );
            })}

            {weekEvents.map((event, idx) => (
              <Event key={event.start + event.end + idx} event={event} />
            ))}

            <Indicator />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { flatten, range } from "lodash";
import cn from "classnames";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import ChevronRight from "@litespace/assets/ChevronRight";
import ChevronLeft from "@litespace/assets/ChevronLeft";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { Void } from "@litespace/types";

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

function makeWeekDays(day: Dayjs) {
  return range(0, cols).map((index) => day.startOf("week").add(index, "day"));
}

export const MonthlyCalendar: React.FC<{
  select?(date: Dayjs): void;
  isSelectable?: (date: Dayjs) => boolean;
  min?: Dayjs;
  max?: Dayjs;
  selected: Dayjs | null;
  disable?: boolean;
}> = ({ select, isSelectable, selected, min, max, disable }) => {
  const value = useMemo(() => selected || dayjs(), [selected]);
  const [date, setDate] = useState<Dayjs>(value.startOf("month"));

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
    <div className="flex flex-col gap-6">
      <Navigation
        nextMonth={nextMonth}
        prevMonth={prevMonth}
        canGoNext={canGoNext}
        canGoBack={canGoBack}
        disabled={disable}
        date={date}
      />
      <div className="flex flex-col gap-5">
        <WeekDays date={date} />
        <MonthDays
          date={date}
          disabled={disable}
          isOutOfRange={isOutOfRange}
          selected={selected}
          select={select}
          isSelectable={isSelectable}
        />
      </div>
    </div>
  );
};

const Navigation: React.FC<{
  prevMonth: Void;
  nextMonth: Void;
  disabled?: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  date: Dayjs;
}> = ({ prevMonth, nextMonth, disabled, canGoBack, canGoNext, date }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-4 w-fit mx-auto">
      <Button
        type="natural"
        variant="secondary"
        endIcon={<ChevronRight className="icon" />}
        htmlType="button"
        size="medium"
        disabled={!canGoBack || disabled}
        onClick={prevMonth}
      />
      <Typography
        tag="span"
        className="flex items-center justify-center text-center text-natural-950 font-semibold lg:font-medium text-caption lg:text-subtitle-2"
      >
        {date.format("MMMM")} {date.get("year")}
      </Typography>
      <Button
        type="natural"
        variant="secondary"
        endIcon={<ChevronLeft className="icon" />}
        htmlType="button"
        size="medium"
        disabled={!canGoNext || disabled}
        onClick={nextMonth}
      />
    </div>
  );
};

const WeekDays: React.FC<{ date: Dayjs }> = ({ date }) => {
  const weekDays = useMemo(() => makeWeekDays(date), [date]);

  return (
    <ul className="grid grid-cols-7 gap-0.5">
      {weekDays.map((day) => (
        <Typography
          tag="li"
          key={day.toISOString()}
          data-today={dayjs().day() === day.day()}
          className="text-center text-tiny text-natural-700 data-[today=true]:text-brand-500"
        >
          {day.format("dddd")}
        </Typography>
      ))}
    </ul>
  );
};

const MonthDays: React.FC<{
  date: Dayjs;
  selected: Dayjs | null;
  isSelectable?(day: Dayjs): void;
  isOutOfRange(day: Dayjs): void;
  select?(date: Dayjs): void;
  disabled?: boolean;
}> = ({ date, selected, isSelectable, isOutOfRange, select, disabled }) => {
  const grid = useMemo(() => makeDayGrid(date), [date]);
  return (
    <ul className="grid grid-cols-7 gap-0.5">
      {grid.map((day) => {
        const isCurrentMonth = day.isSame(date, "month");
        const isToday = day.isSame(dayjs(), "day");
        const isSelected = selected?.isSame(day, "day") || false;
        const selectable = !isSelectable || isSelectable?.(day);
        return (
          <button
            key={day.format("YYYY-MM-DD")}
            disabled={disabled || isOutOfRange(day) || !selectable}
            data-selected={isSelected}
            className={cn(
              "h-[57px] w-[65px] flex items-center justify-center rounded-md",
              "data-[selected=false]:hover:bg-natural-100",
              "data-[selected=true]:bg-brand-500 data-[selected=true]:hover:bg-brand-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              "disabled:opacity-50"
            )}
            onClick={() => select?.(day)}
            type="button"
          >
            <Typography
              tag="span"
              data-selected={isSelected}
              data-current-month={isCurrentMonth}
              className={cn(
                "inline-block text-natural-950 text-tiny relative",
                "data-[selected=true]:data-[current-month=true]:text-natural-50",
                "data-[current-month=false]:text-natural-200"
              )}
            >
              {day.format("D")}
              {isToday ? <TodayPointer /> : null}
            </Typography>
          </button>
        );
      })}
    </ul>
  );
};

const TodayPointer: React.FC = () => (
  <div className="w-[5px] h-[5px] absolute rounded-full mt-[2px] left-1/2 -translate-x-1/2 mx-auto bg-brand-700" />
);

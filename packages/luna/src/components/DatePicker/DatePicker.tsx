import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { ChevronRight, ChevronLeft } from "react-feather";
import { flatten, range } from "lodash";
import { days } from "@/constants/labels";
import cn from "classnames";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { ButtonVariant } from "../Button/types";

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
  }, [onSelect, today]);

  const isDateDisabled = useCallback(
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
    <div className="tw-flex tw-flex-col tw-items-center tw-text-foreground tw-relative">
      <div
        className={cn(
          "tw-flex tw-flex-row tw-items-center tw-justify-between tw-mb-5",
          compact ? "tw-gap-2 tw-text-xs" : "tw-gap-10 tw-w-[300px] "
        )}
      >
        <div>
          <Button
            htmlType="button"
            disabled={!canGoBack || disable}
            onClick={prevMonth}
            size={ButtonSize.Small}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            className={cn(compact && "!tw-p-1 !tw-h-auto")}
          >
            <ChevronRight
              className={cn(compact && "tw-w-[15px] tw-h-[15px]")}
            />
          </Button>
        </div>
        <p className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-text-center">
          {date.format("MMMM")} {year}
        </p>
        <div>
          <Button
            htmlType="button"
            disabled={!canGoNext || disable}
            onClick={nextMonth}
            size={ButtonSize.Small}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            className={cn(compact ? "!tw-p-1 !tw-h-auto" : "")}
          >
            <ChevronLeft className={cn(compact && "tw-w-[15px] tw-h-[15px]")} />
          </Button>
        </div>
        {todayLabel ? (
          <div className="tw-absolute tw-top-0 tw-right-1">
            <Button
              onClick={reset}
              size={ButtonSize.Tiny}
              type={ButtonType.Main}
              variant={ButtonVariant.Secondary}
              className={cn(compact && "!tw-p-1 !tw-h-[25px] tw-text-xs")}
              disabled={disable || isDateDisabled(dayjs())}
            >
              {todayLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <ul
        className={cn(
          "tw-grid tw-grid-cols-7",
          compact ? "tw-gap-1.5" : "tw-gap-4"
        )}
      >
        {days.map((day) => (
          <li
            key={day}
            className={cn(
              "tw-text-center",
              compact ? "tw-text-xs" : "tw-text-sm"
            )}
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
                "tw-text-center tw-relative tw-w-full",
                today.isSame(day, "day") && "tw-ring tw-ring-surface-300",
                compact && "!tw-p-1 !tw-h-auto",
                !isCurrentMonth && "tw-opacity-40"
              )}
              type={ButtonType.Main}
              variant={
                selected && selected.isSame(day, "day")
                  ? ButtonVariant.Primary
                  : ButtonVariant.Secondary
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

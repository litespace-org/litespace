import React, { useCallback, useEffect, useMemo, useState } from "react";
import { flatten, range } from "lodash";
import cn from "classnames";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import { Typography } from "@/components/Typography";

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

export const DateSelection: React.FC<{
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

  useEffect(() => {
    if (selected) setDate(selected.startOf("month"));
  }, [selected]);

  const nextMonth = useCallback(() => {
    setDate(date.add(1, "month"));
  }, [date]);

  const prevMonth = useCallback(() => {
    setDate(date.subtract(1, "month"));
  }, [date]);

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
          "tw-flex tw-flex-row tw-items-center tw-justify-between tw-mb-5 tw-gap-4"
        )}
      >
        <button
          type="button"
          disabled={!canGoBack || disable}
          onClick={prevMonth}
        >
          <ArrowRight className="[&>*]:tw-stroke-brand-700" />
        </button>
        <Typography
          element="subtitle-2"
          weight="medium"
          className="tw-flex tw-items-center tw-justify-center tw-text-center tw-text-natural-950"
        >
          {date.format("MMMM")} {year}
        </Typography>
        <button
          type="button"
          disabled={!canGoNext || disable}
          onClick={nextMonth}
        >
          <ArrowLeft className="[&>*]:tw-stroke-brand-700" />
        </button>
      </div>

      <ul className={cn("tw-grid tw-grid-cols-7 tw-gap-4")}>
        {grid.map((day) => {
          const isCurrentMonth = day.isSame(date, "month");
          const isSelected = selected?.isSame(day, "day");
          return (
            <button
              key={day.format("YYYY-MM-DD")}
              disabled={
                (min && day.isBefore(min, "day")) ||
                (max && day.isAfter(max, "day")) ||
                disable ||
                isDateDisabled(day)
              }
              data-selected={isSelected}
              className={cn(
                "tw-cursor-pointer disabled:tw-cursor-not-allowed",
                "tw-text-center tw-w-20 tw-h-20 tw-border tw-border-natural-900 tw-shadow-date-selection-item tw-rounded-lg",
                isCurrentMonth &&
                  "data-[selected=false]:hover:tw-bg-brand-100 active:tw-bg-brand-700 data-[selected=true]:tw-bg-brand-700",
                today.isSame(day, "day") && "tw-ring tw-ring-surface-300",
                !isCurrentMonth && "tw-opacity-20"
              )}
              onClick={() => onSelect && onSelect(day)}
              type="button"
            >
              <Typography
                element="subtitle-2"
                data-selected={isSelected}
                className="tw-text-natural-950 data-[selected=true]:tw-text-natural-50"
              >
                {day.format("DD")}
              </Typography>
              <Typography
                element="subtitle-2"
                data-selected={isSelected}
                className="tw-text-natural-950 data-[selected=true]:tw-text-natural-50"
              >
                {day.format("ddd")}
              </Typography>
            </button>
          );
        })}
      </ul>
    </div>
  );
};

import { range } from "lodash";
import React, { useMemo } from "react";
import { DAYS_IN_WEEK, HOURS_IN_DAY } from "@/components/Calendar/v2/constants";
import { Dayjs } from "dayjs";
import cn from "classnames";
import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import { HourView } from "@/components/Calendar/v2/types";

export const WeekHours: React.FC<{ day: Dayjs; HourView?: HourView }> = ({
  day,
  HourView,
}) => {
  const week = useMemo(() => {
    const weekStart = day.startOf("week");
    return range(DAYS_IN_WEEK).map((day) => {
      const dayStart = weekStart.add(day, "day").startOf("day");
      const hours = range(HOURS_IN_DAY).map((hour) =>
        dayStart.add(hour, "hour")
      );
      return { day: dayStart, hours };
    });
  }, [day]);

  return (
    <>
      {week.map(({ day, hours }, idx) => {
        const today = day.isSame(dayjs(), "day");
        const lastDay = week.length - 1 === idx;
        return (
          <div
            className="tw-border-r tw-border-natural-300"
            key={day.toISOString()}
          >
            <div
              className={cn(
                "tw-flex tw-items-center tw-justify-center tw-px-3 tw-h-16 tw-border-b tw-border-natural-300",
                today ? "tw-bg-brand-100" : "tw-bg-natural-50",
                lastDay && "tw-rounded-tl-3xl"
              )}
            >
              <Typography
                element="body"
                weight="semibold"
                className="tw-text-brand-700"
              >
                {day.format("dddd D")}
              </Typography>
            </div>

            {hours.map((hour) => {
              const lastHour = hour.hour() === 23;
              return (
                <div
                  key={hour.toISOString()}
                  className={cn(
                    "tw-h-[5.5rem] tw-border-natural-300",
                    !lastHour && "tw-border-b"
                  )}
                >
                  {HourView ? <HourView date={hour} /> : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

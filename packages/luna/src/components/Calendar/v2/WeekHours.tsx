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
      {week.map(({ day, hours }) => {
        const today = day.isSame(dayjs(), "day");
        return (
          <div
            className="tw-border-r tw-border-natural-300"
            key={day.toISOString()}
          >
            <div
              className={cn(
                "tw-flex tw-items-center tw-justify-center tw-px-3 tw-h-16",
                today ? "tw-bg-brand-100" : "tw-bg-natural-50"
              )}
            >
              <Typography
                element="body"
                weight="semibold"
                className={cn(
                  today ? "tw-text-brand-700" : "tw-text-natural-700"
                )}
              >
                {day.format("dddd D")}
              </Typography>
            </div>

            {hours.map((hour) => {
              return (
                <div
                  key={hour.toISOString()}
                  className="tw-h-[5.5rem] tw-border-b tw-border-natural-300"
                >
                  {HourView ? <HourView date={hour} /> : null}
                </div>
              );
            })}
          </div>
        );
      })}
      {/* {hours.map((hour) => {
        const key = hour.toISOString();
        return <div key={key}>{hour.format("DD HH")}</div>;
      })} */}
    </>
  );
};

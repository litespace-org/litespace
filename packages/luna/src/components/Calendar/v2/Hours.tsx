import React, { useMemo } from "react";
import { Dayjs } from "dayjs";
import { range } from "lodash";
import {
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
} from "@/components/Calendar/v2/constants";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const Hours: React.FC<{
  day: Dayjs;
}> = ({ day }) => {
  const hours: Dayjs[] = useMemo(() => {
    const start = day.startOf("day");
    // skip 12am (first hour of the day) because of the design
    return range(1, HOURS_IN_DAY).map((hour) => start.add(hour, "hour"));
  }, [day]);

  const timezone = useMemo(() => {
    const offsetMinutes = day.utcOffset();
    const offsetHours = Math.floor(offsetMinutes / MINUTES_IN_HOUR)
      .toString()
      .padStart(2, "0");
    return `GMT+${offsetHours}`;
  }, [day]);

  return (
    <div>
      <div className="tw-h-16 tw-bg-natural-50 tw-flex tw-items-center tw-justify-center tw-px-3 tw-border-b tw-border-natural-300 tw-rounded-tr-2xl">
        <Typography
          element="body"
          weight="semibold"
          className="tw-text-natural-700"
        >
          {timezone}
        </Typography>
      </div>

      <ul className="tw-flex tw-flex-col">
        {hours.map((hour) => {
          const display = hour.format("h a");
          const key = hour.toISOString();
          return (
            <li className="tw-px-5 tw-h-[5.5rem] tw-relative" key={key}>
              <Typography
                className={cn(
                  "tw-text-natural-700 tw-text-center",
                  "tw-absolute tw-bottom-0 tw-left-1/2 tw-translate-y-1/2 -tw-translate-x-1/2"
                )}
                element="body"
                weight="regular"
              >
                {display}
              </Typography>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

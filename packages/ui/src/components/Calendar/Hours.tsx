import React, { useEffect, useMemo } from "react";
import { Dayjs } from "dayjs";
import { range } from "lodash";
import {
  HOUR_HEIGHT,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
} from "@/components/Calendar/constants";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { Link } from "react-router-dom";
import { asHourId, isHourId } from "@/components/Calendar/utils";

export const Hours: React.FC<{
  day: Dayjs;
}> = ({ day }) => {
  const hours: Dayjs[] = useMemo(() => {
    const start = day.startOf("day");
    // skip 12am (first hour of the day) because of the design
    return range(1, HOURS_IN_DAY + 1).map((hour) => start.add(hour, "hour"));
  }, [day]);

  const timezone = useMemo(() => {
    const offsetMinutes = day.utcOffset();
    const offsetHours = Math.floor(offsetMinutes / MINUTES_IN_HOUR)
      .toString()
      .padStart(2, "0");
    return `GMT+${offsetHours}`;
  }, [day]);

  useEffect(() => {
    const hash = window.location.hash;
    if (isHourId(hash)) document.getElementById(hash)?.scrollIntoView(true);
  }, []);

  return (
    <div>
      <div className="tw-h-16 tw-bg-natural-50 tw-flex tw-items-center tw-justify-center tw-px-3 tw-border-b tw-border-natural-300 tw-rounded-tr-2xl">
        <Typography
          tag="label"
          className="tw-text-natural-700 tw-font-semibold tw-text-body"
        >
          {timezone}
        </Typography>
      </div>

      <ul className="tw-flex tw-flex-col">
        {hours.map((hour, i) => {
          const display = hour.format("h a");
          const key = hour.toISOString();
          const last = i === hours.length - 1;
          const id = asHourId(hour.hour());
          return (
            <li
              key={key}
              className="tw-px-5 tw-relative"
              style={{ height: HOUR_HEIGHT }}
            >
              <Link
                id={id}
                to={id}
                className={cn(
                  "tw-absolute tw-z-calendar-hour tw-bottom-0 tw-left-1/2 tw-translate-y-1/2 -tw-translate-x-1/2"
                )}
              >
                <Typography
                  tag="label"
                  className={cn("tw-text-natural-700 tw-text-center tw-text-body tw-font-regular")}
                >
                  {!last ? display : null}
                </Typography>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

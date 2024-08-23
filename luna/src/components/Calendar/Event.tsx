import React, { useCallback, useMemo } from "react";
import { IEvent } from "@/components/Calendar/types";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { useMediaQuery } from "react-responsive";

/**
 * "Dayjs" index days from Sunday (0) to Saturday (6)
 *
 * In arabic, we index days from Saturday (0) to Friday (6)
 *
 * @param day Number from 0 (Sunday) to 6 (Saturday)
 * @returns Number from 0 (Saturday) to 6 (Friday)
 */
function asArabicDayIndex(day: number) {
  return day < 6 ? day + 1 : 0;
}

const Event: React.FC<{
  event: IEvent;
  wrapper: boolean;
  wrapped: boolean;
}> = ({ event, wrapper, wrapped }) => {
  const start = useMemo(() => dayjs(event.start), [event.start]);
  const end = useMemo(() => dayjs(event.end), [event.end]);
  const arabicDayIndex = useMemo(() => asArabicDayIndex(start.day()), [start]);
  const hour = useMemo(() => start.hour(), [start]);
  const minutes = useMemo(() => start.minute(), [start]);
  const length = useMemo(() => end.diff(start, "minutes"), [end, start]);

  const sm = useMediaQuery({ query: "(min-width: 640px)" });
  const md = useMediaQuery({ query: "(min-width: 768px)" });
  const lg = useMediaQuery({ query: "(min-width: 1024px)" });
  const xl = useMediaQuery({ query: "(min-width: 1280px)" });
  const xxl = useMediaQuery({ query: "(min-width: 1536px)" });

  const width = useMemo(() => {
    if (xxl) return 205;
    if (xl) return 170;
    if (lg) return 130;
    if (md) return 100;
    if (sm) return 80;
    return 70;
  }, [lg, md, sm, xl, xxl]);

  const height = useMemo(() => {
    if (xxl) return 90;
    if (xl || lg) return 80;
    if (md || sm) return 60;
    return 50;
  }, [lg, md, sm, xl, xxl]);

  const dimensions = useMemo(() => {
    const hour = height;
    const minute = hour / 60;
    const childOffset = 0.05 * width;
    const childWidth = width - childOffset;
    const parentWidth = 0.8 * width;
    return {
      width,
      height,
      hour,
      minute,
      childWidth,
      parentWidth,
      childOffset,
    };
  }, [height, width]);

  const minutesToPixelsHight = useCallback(
    (minutes: number): number => {
      return minutes * dimensions.minute;
    },
    [dimensions.minute]
  );

  const hoursToPixelsHight = useCallback(
    (hours: number): number => {
      return hours * dimensions.hour;
    },
    [dimensions.hour]
  );

  const style = useMemo(() => {
    const rightOffset = arabicDayIndex * dimensions.width;
    return {
      top: hoursToPixelsHight(hour) + minutesToPixelsHight(minutes),
      right: wrapped ? rightOffset + dimensions.childOffset : rightOffset + 1,
      width: wrapped
        ? dimensions.childWidth - 1
        : wrapper
          ? dimensions.parentWidth - 1
          : dimensions.width - 1,
      height: minutesToPixelsHight(length) - 1,
      zIndex: 1000 - length,
      borderRadius: "4px",
    };
  }, [
    arabicDayIndex,
    dimensions.childOffset,
    dimensions.childWidth,
    dimensions.parentWidth,
    dimensions.width,
    hour,
    hoursToPixelsHight,
    length,
    minutes,
    minutesToPixelsHight,
    wrapped,
    wrapper,
  ]);

  return (
    <div
      className={cn(
        "absolute bg-surface-200 shadow-xl",
        "border border-border-control hover:border-border-stronger transition-colors duration-200",
        "flex items-start justify-start",
        length <= 30
          ? "text-[0.5rem] px-1 lg:text-xs lg:px-2 lg:py-0.5"
          : "text-[0.6rem] px-1 lg:text-sm py-1 lg:px-2 lg:py-1"
      )}
      style={style}
    >
      <p className="truncate">
        {event.title}, {dayjs(event.start).format("h:mm a")}
      </p>
    </div>
  );
};

export default Event;

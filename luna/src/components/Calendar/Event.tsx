import React, { useMemo } from "react";
import { IEvent } from "@/components/Calendar/types";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { asArabicDayIndex } from "@/lib/time";

const ONE_HOUR_HIGHT = 80; // 80px
const ONE_MINTUE_HIGHT = ONE_HOUR_HIGHT / 60;
const EVENT_BOX_WIDTH = 250;
const CHILD_EVENT_OFFSET = 130;
const CHILD_EVENT_WIDTH = 120;
const WRAPPER_BOX_WIDTH = 150;

function mintuesToPixelsHight(mintues: number): number {
  return mintues * ONE_MINTUE_HIGHT;
}

function hoursToPixelsHight(hours: number): number {
  return hours * ONE_HOUR_HIGHT;
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
  const mintues = useMemo(() => start.minute(), [start]);
  const length = useMemo(() => end.diff(start, "minutes"), [end, start]);

  const style = useMemo(() => {
    const rightOffset = arabicDayIndex * 250;
    return {
      top: hoursToPixelsHight(hour) + mintuesToPixelsHight(mintues),
      right: wrapped ? rightOffset + CHILD_EVENT_OFFSET : rightOffset + 1,
      width: wrapped
        ? CHILD_EVENT_WIDTH - 1
        : wrapper
          ? WRAPPER_BOX_WIDTH - 1
          : EVENT_BOX_WIDTH - 1,
      height: mintuesToPixelsHight(length) - 1,
      zIndex: 1000 - length,
      borderRadius: "4px",
    };
  }, [arabicDayIndex, hour, length, mintues, wrapped, wrapper]);

  return (
    <div
      className={cn(
        "absolute bg-surface-200 shadow-xl",
        "border border-border-stronger",
        length <= 30 ? "text-xs px-2 py-0.5" : "text-base px-4 py-1"
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

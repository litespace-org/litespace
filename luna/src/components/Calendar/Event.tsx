import React, { useMemo } from "react";
import { IEvent } from "@/components/Calendar/types";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { asArabicDayIndex } from "@/lib/time";

const ONE_HOUR_HIGHT = 80; // 80px
const ONE_MINTUE_HIGHT = ONE_HOUR_HIGHT / 60;

function mintuesToPixelsHight(mintues: number): number {
  return mintues * ONE_MINTUE_HIGHT;
}

function hoursToPixelsHight(hours: number): number {
  return hours * ONE_HOUR_HIGHT;
}

const Event: React.FC<{ event: IEvent }> = ({ event }) => {
  const start = useMemo(() => dayjs(event.start), [event.start]);
  const end = useMemo(() => dayjs(event.end), [event.end]);
  const arabicDayIndex = useMemo(() => asArabicDayIndex(start.day()), [start]);
  const hour = useMemo(() => start.hour(), [start]);
  const mintues = useMemo(() => start.minute(), [start]);

  const style = useMemo(() => {
    const length = end.diff(start, "minutes");
    return {
      top: hoursToPixelsHight(hour) + mintuesToPixelsHight(mintues),
      right: arabicDayIndex * 250,
      width: "250px",
      height: mintuesToPixelsHight(length),
    };
  }, [arabicDayIndex, end, hour, mintues, start]);

  return (
    <div
      className={cn(
        "absolute bg-surface-200 shadow-xl roudned",
        "border border-border-stronger px-4"
      )}
      style={style}
    >
      {dayjs(event.start).format("h:mm a")} -{" "}
      {dayjs(event.end).format("h:mm a")}
    </div>
  );
};

export default Event;

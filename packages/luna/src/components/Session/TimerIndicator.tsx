import Timer from "@litespace/assets/TimerIndicator";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Typography } from "@/components/Typography";
import dayjs from "dayjs";

/**
 * Timer interval in minutes.
 */
const TIMER_INTERVAL = 1000;

const formatTime = (minutes: number) => {
  return `${minutes.toString().padStart(2, "0")}:00`;
};

export const TimerIndicator: React.FC<{
  /**
   * ISO UTC datetime
   */
  startAt: string;
  /**
   * Call duration in minutes.
   */
  duration: number;
}> = ({ startAt, duration }) => {
  const start = useMemo(() => dayjs(startAt), [startAt]);
  const end = useMemo(() => start.add(duration, "minute"), [start, duration]);
  const [timer, setTimer] = useState<string>(formatTime(duration));

  const updateTimer = useCallback(() => {
    const now = dayjs();
    if (now.isBetween(start, end, "seconds", "[]")) {
      const diff = end.diff(now, "minutes");
      return setTimer(formatTime(diff));
    }
    if (now.isAfter(end, "seconds")) return setTimer(formatTime(0));
    if (now.isBefore(start)) return setTimer(formatTime(duration));
  }, [duration, end, start]);

  useEffect(() => {
    updateTimer();
  }, [end, start, updateTimer]);

  useEffect(() => {
    const interval = setInterval(updateTimer, TIMER_INTERVAL);
    return () => clearInterval(interval);
  }, [duration, startAt, updateTimer]);

  return (
    <div className="tw-bg-background-indicator tw-rounded-full tw-p-4 tw-backdrop-blur-[15px] tw-gap-2 tw-flex tw-items-center">
      <Typography
        className="tw-text-natural-50"
        element="subtitle-2"
        weight="semibold"
        dir="ltr"
      >
        {timer}
      </Typography>
      <Timer />
    </div>
  );
};

export default TimerIndicator;
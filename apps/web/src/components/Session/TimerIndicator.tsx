import Timer from "@litespace/assets/TimerIndicator";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
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
    <div className="bg-background-indicator rounded-full p-3 lg:p-4 backdrop-blur-[15px] gap-2 flex items-center">
      <Typography
        dir="ltr"
        tag="span"
        className="text-natural-50 font-bold lg:font-semibold text-tiny lg:text-subtitle-2"
      >
        {timer}
      </Typography>
      <Timer className="w-4 h-4 lg:w-8 lg:h-8 [&>*]:fill-natural-50" />
    </div>
  );
};

export default TimerIndicator;

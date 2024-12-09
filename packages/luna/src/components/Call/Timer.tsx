import Timer from "@litespace/assets/Timer";
import React, { useCallback, useEffect, useState } from "react";
import { Typography } from "../Typography";
import dayjs from "dayjs";
export const TimerIndicator: React.FC<{
  startAt: string;
  duration: number;
}> = ({ startAt, duration }) => {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    // Parse the start time and calculate the initial time left
    const startTime = dayjs(startAt);
    const endTime = startTime.add(duration, "minute");
    const now = dayjs();
    console.log({ startTime, endTime, now });

    const initialTimeLeft = endTime.diff(now, "second");
    console.log(initialTimeLeft);

    if (initialTimeLeft > 0) {
      setTime(initialTimeLeft);
    } else {
      setTime(0); // Timer has already expired
    }

    // Update the timer every second
    const interval = setInterval(() => {
      const now = dayjs();
      const currentTimeLeft = endTime.diff(now, "second");
      setTime(currentTimeLeft > 0 ? currentTimeLeft : 0);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval
  }, [startAt, duration]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return (
    <div className="tw-bg-background-indicator tw-rounded-full tw-p-4 tw-backdrop-blur-[15px] tw-gap-2 tw-flex tw-items-center">
      <Typography
        element="subtitle-2"
        dir="ltr"
        className="tw-font-semibold tw-text-natural-50"
      >
        {formatTime(time)}
      </Typography>
      <Timer />
    </div>
  );
};

export default TimerIndicator;

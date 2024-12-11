import Timer from "@litespace/assets/TimerIndicator";
import React, { useCallback, useEffect, useState } from "react";
import { Typography } from "@/components/Typography";
import dayjs from "dayjs";

export const TimerIndicator: React.FC<{
  startAt: string;
  duration: number;
}> = ({ startAt, duration }) => {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    const startTime = dayjs(startAt);
    const endTime = startTime.add(duration, "minute");
    const now = dayjs();

    const initialTimeLeft = endTime.diff(now, "second");

    if (initialTimeLeft > 0) {
      setTime(initialTimeLeft);
    } else {
      setTime(0);
    }

    const interval = setInterval(() => {
      const now = dayjs();
      const currentTimeLeft = endTime.diff(now, "second");
      setTime(currentTimeLeft > 0 ? currentTimeLeft : 0);
    }, 1000);

    return () => clearInterval(interval);
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

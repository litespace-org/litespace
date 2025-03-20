import React, { useEffect, useState, useCallback } from "react";
import dayjs from "@/lib/dayjs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import TimerIndicator from "@litespace/assets/TimerIndicator";

const Timer: React.FC<{ start: string; duration: number }> = ({
  start,
  duration,
}) => {
  const intl = useFormatMessage();
  const [displayText, setDisplayText] = useState<React.ReactNode>(null);

  const updateTimer = useCallback(() => {
    const now = dayjs();
    const startTime = dayjs(start);
    const endTime = startTime.add(duration, "m");

    if (now.isBefore(startTime)) {
      return intl.rich("session.will-start-in", {
        timer: (
          <span className="font-bold text-brand-700 text-caption">
            {startTime.fromNow(true)}
          </span>
        ),
      });
    }

    if (now.isAfter(endTime)) {
      return intl.rich("session.ended-since", {
        timer: (
          <span className="font-bold text-brand-700 text-caption">
            {endTime.fromNow(true)}
          </span>
        ),
      });
    }

    const remainingMinutes = endTime.diff(now, "minutes");

    return intl.rich("session.time-remaining", {
      timer: (
        <span className="font-bold text-brand-700 text-caption">
          {remainingMinutes}
        </span>
      ),
    });
  }, [start, duration, intl]);

  useEffect(() => {
    setDisplayText(updateTimer());
    const interval = setInterval(() => {
      setDisplayText(updateTimer());
    }, 1_000);
    return () => clearInterval(interval);
  }, [updateTimer]);

  return (
    <div className="flex gap-1 md:gap-2 items-center">
      <TimerIndicator className="[&_*]:fill-brand-700 w-4 h-4 md:w-6 md:h-6" />
      <Typography
        tag="p"
        className="text-tiny md:font-semibold text-natural-700 md:text-caption"
      >
        {displayText}
      </Typography>
    </div>
  );
};

export default Timer;

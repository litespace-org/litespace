import React, { useEffect, useState, useCallback } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import TimerIndicator from "@litespace/assets/TimerIndicator";
import dayjs from "@/lib/dayjs";
import { formatMinutes } from "@litespace/ui/utils";

const Timer: React.FC<{ start: string; duration: number }> = ({
  start,
  duration,
}) => {
  const intl = useFormatMessage();

  const getTimerText = useCallback(() => {
    const now = dayjs();
    const startTime = dayjs(start);
    const endTime = startTime.add(duration, "m");

    if (now.isBefore(startTime)) {
      const diff = startTime.diff(now, "minutes") || 1;
      return intl("session.will-start-in", {
        duration: diff <= 60 ? formatMinutes(diff) : startTime.fromNow(true),
      });
    }

    if (now.isAfter(endTime)) {
      const diff = endTime.diff(now, "minutes") || 1;
      return intl("session.ended-since", {
        duration: diff >= 60 ? formatMinutes(diff) : endTime.fromNow(true),
      });
    }

    const diff = endTime.diff(now, "minutes") || 1;
    return intl("session.time-remaining", {
      duration: formatMinutes(diff),
    });
  }, [start, duration, intl]);

  const [displayText, setDisplayText] = useState<string>(getTimerText());

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText(getTimerText());
    }, 1_000);
    return () => clearInterval(interval);
  }, [getTimerText]);

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

import React, { useCallback, useEffect, useState } from "react";
import dayjs from "@/lib/dayjs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import TimerIndicator from "@litespace/assets/TimerIndicator";

const Timer: React.FC<{ start: string; duration: number }> = ({
  start,
  duration,
}) => {
  const intl = useFormatMessage();
  const [minutes, setMinutes] = useState<number>(0);

  const getMinutes = useCallback(() => {
    const now = dayjs();
    const startTime = dayjs(start);
    const endTime = startTime.add(duration, "m");
    if (now.isBefore(startTime)) return duration;
    if (now.isAfter(endTime)) return 0;
    return now.diff(startTime, "m");
  }, [start, duration]);

  useEffect(() => {
    const id = setTimeout(() => {
      setMinutes(getMinutes());
    }, 1_000);
    return () => {
      clearTimeout(id);
    };
  }, [getMinutes]);

  return (
    <div className="flex gap-1 md:gap-2 items-center">
      <TimerIndicator className="[&_*]:fill-brand-700 w-4 h-4 md:w-6 md:h-6" />
      <Typography
        tag="p"
        className="text-tiny md:font-semibold text-natural-700 md:text-caption"
      >
        {intl.rich("session.timer", {
          time: (
            <span className="font-bold text-brand-700 text-caption">
              {minutes || "00"}:00
            </span>
          ),
        })}
      </Typography>
    </div>
  );
};

export default Timer;

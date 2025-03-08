import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import TimerIndicator from "@litespace/assets/TimerIndicator";

const Timer: React.FC<{ start: string; duration: number }> = ({
  start,
  duration,
}) => {
  const intl = useFormatMessage();
  const remainingTime = useMemo(() => {
    const now = dayjs();
    const startTime = dayjs(start);
    const endTime = startTime.add(duration, "m");

    if (now.isBefore(startTime)) return `${duration}:00`;
    if (now.isAfter(endTime)) return `00:00`;

    const remaining = now.diff(startTime, "m");
    return `${remaining}:00`;
  }, [start, duration]);

  return (
    <div className="flex gap-1 md:gap-2 items-center">
      <TimerIndicator className="[&_*]:fill-brand-700 w-4 h-4 md:w-6 md:h-6" />
      <Typography
        tag="p"
        className="text-tiny md:font-semibold text-natural-700 md:text-caption"
      >
        {intl.rich("session.timer", {
          time: remainingTime,
          timer: () => (
            <span className="font-bold text-brand-700 text-caption">
              {remainingTime}
            </span>
          ),
        })}
      </Typography>
    </div>
  );
};

export default Timer;

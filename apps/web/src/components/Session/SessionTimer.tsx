import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Typography } from "@litespace/ui/Typography";
import Timer from "@litespace/assets/Timer";

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const SessionTimer: React.FC<{
  startTime: string;
  /**
   * the session duration in minutes.
   */
  duration?: number;
}> = ({ startTime, duration }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const sessionStart = dayjs(startTime);
      const diff = now.diff(sessionStart, "seconds");
      setElapsedSeconds(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const showWarning = useMemo(() => {
    if (!duration) return false;
    return elapsedSeconds / 60 >= duration - 1;
  }, [elapsedSeconds, duration]);

  const formattedTime = useMemo(
    () => formatTime(elapsedSeconds),
    [elapsedSeconds]
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 px-[8px] py-3 justify-center items-center gap-1.5 bg-[#0D0D0D4D] backdrop-blur-[7.5px] rounded-[80px] z-10">
        <Typography
          tag="span"
          className="text-base font-medium text-natural-50"
        >
          {formattedTime}
        </Typography>
        <Timer className="flex w-4 h-4 justify-center items-center [&>*]:stroke-natural-50" />
      </div>

      {/* warning circle */}
      {showWarning ? (
        <div className="relative flex justify-center items-center">
          <span className="absolute h-2 w-2 animate-ping rounded-full bg-warning-400 opacity-75"></span>
          <span className="absolute h-2 w-2 rounded-full bg-warning-400"></span>
        </div>
      ) : null}
    </div>
  );
};

export default SessionTimer;

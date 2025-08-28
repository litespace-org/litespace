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
}> = ({ startTime }) => {
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

  const formattedTime = useMemo(
    () => formatTime(elapsedSeconds),
    [elapsedSeconds]
  );

  return (
    <div className="absolute top-4 left-14 flex items-center gap-1.5 bg-[#0D0D0D4D] rounded-full p-[7px] z-[10]">
      <Typography
        tag="span"
        className="text-body justify-center text-xs font-medium text-natural-50"
      >
        {formattedTime}
      </Typography>
      <Timer className="w-3 h-3 justify-center [&>*]:stroke-natural-50" />
    </div>
  );
};

export default SessionTimer;

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
  start: string;
}> = ({ start }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const sessionStart = dayjs(start);
      const diff = now.diff(sessionStart, "seconds");
      setElapsedSeconds(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [start]);

  const formattedTime = useMemo(
    () => formatTime(elapsedSeconds),
    [elapsedSeconds]
  );

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0D0D0D4D] rounded-full p-[10px]">
      <Typography
        tag="span"
        className="text-body text-xl font-medium text-natural-50"
      >
        {formattedTime}
      </Typography>
      <Timer className="w-5 h-5 justify-center [&>*]:stroke-natural-50" />
    </div>
  );
};

export default SessionTimer;

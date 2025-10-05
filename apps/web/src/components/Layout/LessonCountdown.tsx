import { Typography } from "@litespace/ui/Typography";
import React from "react";

type Props = {
  label: string;
  seconds: number | null;
};

const LessonCountdown: React.FC<Props> = ({ label, seconds }) => {
  if (seconds === null) return null;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="flex flex-col items-center gap-1 mr-6 ml-auto w-[203px] h-[42px] text-center">
      <Typography
        tag="span"
        className="text-tiny font-semibold text-natural-600"
      >
        {label}
      </Typography>

      <div className="flex items-center gap-3">
        <Typography tag="span" className="text-base font-bold text-brand-500">
          {secs}
        </Typography>
        <Typography tag="span" className="text-base font-bold text-brand-500">
          :
        </Typography>
        <Typography tag="span" className="text-base font-bold text-brand-500">
          {minutes}
        </Typography>
        <Typography tag="span" className="text-base font-bold text-brand-500">
          :
        </Typography>
        <Typography tag="span" className="text-base font-bold text-brand-500">
          {hours}
        </Typography>
      </div>
    </div>
  );
};

export default LessonCountdown;

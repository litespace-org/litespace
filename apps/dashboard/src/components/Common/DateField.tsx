import React from "react";
import { dayjs } from "@/lib/dayjs";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";

const DateField: React.FC<{ date: string }> = ({ date }) => {
  return (
    <Tooltip
      content={
        <div className="text-center leading-relaxed">
          <Typography tag="span" className="text-caption">
            {dayjs(date).format("dddd D MMMM YYYY hh:mm a")}
            <br />({dayjs(date).fromNow()})
          </Typography>
        </div>
      }
    >
      <div className="w-fit">
        <Typography
          tag="p"
          className="text-body font-semibold text-natural-800"
        >
          {dayjs(date).format("D/M/YYYY")}
        </Typography>
      </div>
    </Tooltip>
  );
};

export default DateField;

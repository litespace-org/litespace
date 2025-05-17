import React, { useMemo } from "react";
import { dayjs } from "@/lib/dayjs";
import { Tooltip } from "@litespace/ui/Tooltip";

const DateField: React.FC<{ date: string }> = ({ date }) => {
  const formatedDate = useMemo(() => dayjs(date).format("D/M/YYYY"), [date]);
  return (
    <Tooltip
      content={
        <div className="max-w-52 text-center leading-relaxed">
          <span>
            {dayjs(date).format("dddd D MMMM YYYY hh:mm a")}&nbsp;(
            {dayjs(date).fromNow()})
          </span>
        </div>
      }
    >
      <span className="text-body font-semibold text-natural-800">
        {formatedDate}
      </span>
    </Tooltip>
  );
};

export default DateField;

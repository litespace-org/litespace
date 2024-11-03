import React, { useMemo } from "react";
import { dayjs } from "@/lib/dayjs";
import { Popover } from "@litespace/luna/Popover";

const DateField: React.FC<{ date: string }> = ({ date }) => {
  const formatedDate = useMemo(() => dayjs(date).format("YYYY/MM/DD"), [date]);
  return (
    <Popover
      content={
        <span>
          {dayjs(date).format("dddd D MMMM YYYY h:m a ")}&nbsp;(
          {dayjs(date).fromNow()})
        </span>
      }
    >
      <span>{formatedDate}</span>
    </Popover>
  );
};

export default DateField;

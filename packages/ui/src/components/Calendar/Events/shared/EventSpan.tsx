import React from "react";
import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";

export const EventSpan: React.FC<{
  start: string | null;
  end: string | null;
}> = ({ start, end }) => {
  return (
    <Typography tag="span" className="text-brand-700 text-tiny text-semibold">
      {start ? dayjs(start).format("h:mm a") : "??"}&nbsp;-&nbsp;
      {end ? dayjs(end).format("h:mm a") : "??"}
    </Typography>
  );
};

import React from "react";
import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";

export const EventSpan: React.FC<{
  start: string | null;
  end: string | null;
}> = ({ start, end }) => {
  return (
    <Typography
      tag="label"
      className="tw-text-brand-700 tw-text-xs tw-text-semibold"
    >
      {start ? dayjs(start).format("h:mm a") : "??"}&nbsp;-&nbsp;
      {end ? dayjs(end).format("h:mm a") : "??"}
    </Typography>
  );
};

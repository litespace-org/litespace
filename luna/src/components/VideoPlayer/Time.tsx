import React, { useMemo } from "react";

const SECONDS_OF_HOUR = 3600;
const SECONDS_OF_MINUTE = 60;

function field(value: number): string {
  return value.toString().padStart(2, "0");
}

function fields(...values: number[]): string {
  return values.map((value) => field(value)).join(":");
}

function format(time: number, length?: number) {
  const hours = Math.floor(time / SECONDS_OF_HOUR);
  const minutes = Math.floor((time % SECONDS_OF_HOUR) / SECONDS_OF_MINUTE);
  const seconds = Math.floor(time % SECONDS_OF_MINUTE);

  const half = { text: fields(minutes, seconds), length: 2 };
  const full = { text: fields(hours, minutes, seconds), length: 3 };

  if (length === 2) return half;
  if (length === 3) return full;
  if (!hours) return { text: fields(minutes, seconds), length: 2 };
  return { text: fields(hours, minutes, seconds), length: 3 };
}

const Time: React.FC<{ current?: number; total?: number }> = ({
  current,
  total,
}) => {
  const duration = useMemo(() => (total ? format(total) : null), [total]);

  return (
    <div dir="ltr">
      {duration ? format(current || 0, duration.length).text : "-"} &#47;
      {duration ? duration.text : "-"}
    </div>
  );
};

export default Time;

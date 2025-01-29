import { Select } from "@/components/Select";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import React from "react";

export const DurationSelection: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      <Typography element="subtitle-2" className="tw-text-natural-950">
        {intl("book-lesson.pick-lesson-duration")}
      </Typography>
      <div className="tw-w-[400px]">
        <Select
          options={[
            {
              label: formatMinutes(15),
              value: 15,
            },
            {
              label: formatMinutes(30),
              value: 30,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

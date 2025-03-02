import { Select } from "@/components/Select";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import React from "react";

export const DurationSelection: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full">
        <Select
          label={intl("book-lesson.pick-lesson-duration")}
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

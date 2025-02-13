import { SelectV2 } from "@/components/Select";
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
      <div className="tw-w-[400px]">
        <SelectV2
          label={intl("book-lesson.pick-lesson-duration")}
          options={[
            {
              label: formatMinutes(15),
              value: 15,
            },
            {
              label: formatMinutes(30),
              value: 30,
              disabled: true,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

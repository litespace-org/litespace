import { formatMinutes } from "@/components/utils";
import React from "react";
import { Selectable } from "@/components/Lessons/ManageLesson/Selectable";
import { LESSON_DURATION_LIST } from "@litespace/utils";

export const DurationSelection: React.FC<{
  value: number;
  remainingWeeklyMinutes: number;
  onChange: (value: number) => void;
}> = ({ value, remainingWeeklyMinutes, onChange }) => {
  return (
    <div className="flex flex-col gap-4 my-6">
      {LESSON_DURATION_LIST.map((duration) => (
        <Selectable
          disabled={remainingWeeklyMinutes < duration}
          name="duration"
          isSelected={value === duration}
          label={formatMinutes(duration)}
          onSelect={() => onChange(duration)}
        />
      ))}
    </div>
  );
};

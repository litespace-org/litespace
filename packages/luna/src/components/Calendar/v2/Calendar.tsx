import React from "react";
import { Dayjs } from "dayjs";
import { Hours } from "@/components/Calendar/v2/Hours";
import {
  AvailabilitySlotProps,
  LessonActions,
  LessonProps,
  SlotActions,
} from "@/components/Calendar/v2/types";
import cn from "classnames";
import { WeekTable } from "@/components/Calendar/v2/WeekTable";

interface Props {
  date: Dayjs;

  lessons?: LessonProps[];
  lessonActions?: LessonActions;

  slots?: AvailabilitySlotProps[];
  slotActions?: SlotActions;
}

export const Calendar: React.FC<Props> = ({
  date,
  lessons,
  lessonActions,
  slots,
  slotActions,
}) => {
  return (
    <div className="tw-w-full">
      <div
        className={cn(
          "tw-w-full tw-flex tw-bg-natural-50 tw-border tw-border-natural-300",
          "tw-shadow-calendar tw-rounded-2xl"
        )}
      >
        <Hours day={date} />
        <div className="tw-grid tw-grid-cols-7 tw-w-full tw-rounded-tl-3xl">
          <WeekTable
            day={date}
            slots={slots}
            slotActions={slotActions}
            lessons={lessons}
            lessonActions={lessonActions}
          />
        </div>
      </div>
    </div>
  );
};

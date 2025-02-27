import React from "react";
import { Dayjs } from "dayjs";
import { Hours } from "@/components/Calendar/Hours";
import {
  AvailabilitySlotProps,
  LessonActions,
  LessonProps,
  SlotActions,
} from "@/components/Calendar/types";
import cn from "classnames";
import { WeekTable } from "@/components/Calendar/WeekTable";

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
    <div
      className={cn(
        "w-full h-full overflow-x-auto",
        "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent"
      )}
    >
      <div
        className={cn(
          "w-full flex bg-natural-50 border border-natural-300",
          "shadow-calendar rounded-2xl min-w-[1200px]"
        )}
      >
        <Hours day={date} />
        <div className="grid grid-cols-7 w-full rounded-tl-2xl">
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

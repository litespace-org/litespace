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
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
  const { lg } = useMediaQuery();
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
          "shadow-calendar rounded-2xl"
        )}
      >
        <Hours day={date} />
        <div
          className={cn(
            "grid w-full rounded-tl-2xl",
            lg ? "grid-cols-7" : "grid-cols-4"
          )}
        >
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

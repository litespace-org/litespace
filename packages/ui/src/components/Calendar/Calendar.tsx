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
import { Loader, LoadingError } from "@/components/Loading";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";

interface Props {
  date: Dayjs;
  lessons?: LessonProps[];
  lessonActions?: LessonActions;
  slots?: AvailabilitySlotProps[];
  slotActions?: SlotActions;
  loading: boolean;
  error: boolean;
  retry: Void;
}

export const Calendar: React.FC<Props> = ({
  date,
  lessons,
  lessonActions,
  slots,
  slotActions,
  loading,
  error,
  retry,
}) => {
  const { xxl } = useMediaQuery();
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loader
          size="medium"
          text={intl("manage-schedule.manage-dialog.loading.message")}
        />
      </div>
    );

  if (error)
    return (
      <div className="mt-[15vh]">
        <LoadingError
          size="medium"
          error={intl("manage-schedule.manage-dialog.error.message")}
          retry={retry}
        />
      </div>
    );

  return (
    <div>
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
            xxl ? "grid-cols-7" : "grid-cols-4"
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

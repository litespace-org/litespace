import { range } from "lodash";
import React, { useMemo } from "react";
import { DAYS_IN_WEEK, HOUR_HEIGHT } from "@/components/Calendar/constants";
import { Dayjs } from "dayjs";
import cn from "classnames";
import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import {
  AvailabilitySlotProps,
  SlotActions,
  LessonActions,
  LessonProps,
} from "@/components/Calendar/types";
import { HOURS_IN_DAY } from "@litespace/sol/constants";
import { AvailabilitySlot } from "@/components/Calendar/Events";
import { LessonSlot } from "@/components/Calendar/Events/LessonSlot/LessonSlot";

export const WeekTable: React.FC<{
  day: Dayjs;
  lessons?: LessonProps[];
  lessonActions?: LessonActions;
  slots?: AvailabilitySlotProps[];
  slotActions?: SlotActions;
}> = ({ day, lessons, lessonActions, slots, slotActions }) => {
  const week = useMemo(() => {
    const weekStart = day.startOf("week");
    return range(DAYS_IN_WEEK).map((day) => {
      const dayStart = weekStart.add(day, "day").startOf("day");
      const hours = range(HOURS_IN_DAY).map((hour) =>
        dayStart.add(hour, "hour")
      );
      return { day: dayStart, hours };
    });
  }, [day]);

  return (
    <>
      {week.map(({ day, hours }, idx) => {
        const today = day.isSame(dayjs(), "day");
        const lastDay = week.length - 1 === idx;
        return (
          <div
            className="tw-relative tw-border-r tw-border-natural-300"
            key={day.toISOString()}
          >
            <div
              className={cn(
                "tw-flex tw-items-center tw-justify-center tw-px-3 tw-h-16 tw-border-b tw-border-natural-300",
                today ? "tw-bg-brand-100" : "tw-bg-natural-50",
                lastDay && "tw-rounded-tl-3xl"
              )}
            >
              <Typography
                element="body"
                weight="semibold"
                className="tw-text-brand-700"
              >
                {day.format("dddd D")}
              </Typography>
            </div>

            <div className="tw-absolute tw-w-full">
              {hours.map((hour, i) => {
                const lastHour = i === hours.length - 1;
                return (
                  <div
                    key={hour.toISOString()}
                    className={cn(
                      "tw-border-natural-300 tw-p-2",
                      !lastHour && "tw-border-b"
                    )}
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {lessons ? (
                      <LessonSlot
                        lessons={lessons.filter((lesson) =>
                          hour.isSame(lesson.start)
                        )}
                        {...lessonActions}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {slots
              ? slots
                  .filter((slot) =>
                    dayjs(slot.start).startOf("day").isSame(day)
                  )
                  .map((slot) => {
                    return (
                      <div
                        key={slot.id}
                        className="tw-absolute tw-w-full tw-h-full tw-p-1"
                      >
                        <AvailabilitySlot {...slot} {...slotActions} />
                      </div>
                    );
                  })
              : null}
          </div>
        );
      })}
    </>
  );
};

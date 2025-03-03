import { Dayjs } from "dayjs";
import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import { OptionsMenu } from "@/components/Calendar/Events/AvailabilitySlots/AvailabilitySlots";
import {
  LessonActions,
  LessonProps,
  SlotActions,
  AvailabilitySlotProps,
} from "@/components/Calendar/types";
import { useMemo } from "react";
import { range } from "lodash";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils";

const DAYS_IN_WEEK = 7;

export const MobileDaySlot: React.FC<{
  day: Dayjs;
  lessons?: LessonProps[];
  lessonActions?: LessonActions;
  slots?: AvailabilitySlotProps[];
  slotActions?: SlotActions;
}> = ({ day, slots, slotActions }) => {
  const week = useMemo(() => {
    const weekStart = day.startOf("week");
    return range(DAYS_IN_WEEK).map((day) => {
      const dayStart = weekStart.add(day, "day").startOf("day");
      return { day: dayStart };
    });
  }, [day]);

  return (
    <div className="flex flex-col gap-4 max-w-[450px] mx-auto">
      {week.map(({ day }) => {
        return (
          <div
            key={day.toISOString()}
            className="relative bg-natural-50 border border-natural-200 rounded-2xl p-4 shadow-header"
          >
            <Typography tag="h4" className="text-caption font-bold mb-1">
              {dayjs(day).startOf("day").format("dddd D MMMM")}
            </Typography>
            {slots
              ? slots
                  .filter((slot) =>
                    dayjs(slot.start).startOf("day").isSame(day)
                  )
                  .map((slot) => {
                    return (
                      <div key={slot.id}>
                        <div className="absolute top-4 left-4">
                          <OptionsMenu
                            onEdit={() =>
                              slotActions?.onEdit && slotActions?.onEdit(slot)
                            }
                            onDelete={() =>
                              slotActions?.onDelete &&
                              slotActions?.onDelete(slot.id)
                            }
                          />
                        </div>

                        <Typography
                          tag="span"
                          className="text-tiny font-normal"
                        >
                          {dayjs(slot.start).format("hh:mm a")}
                          {" - "}
                          {dayjs(slot.end).format("hh:mm a")}
                        </Typography>
                        <div className="flex">
                          {slot.members.map((member) => (
                            <div className="w-[43px] h-[43px] rounded-[4px] overflow-hidden">
                              <Avatar
                                alt={orUndefined(member.name)}
                                src={orUndefined(member.image)}
                                seed={member.id?.toString()}
                              />
                              {member.image}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              : null}
          </div>
        );
      })}
    </div>
  );
};

export default MobileDaySlot;

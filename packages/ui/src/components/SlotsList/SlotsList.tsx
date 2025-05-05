import { OptionsMenu } from "@/components/Calendar/Events/AvailabilitySlots/AvailabilitySlots";
import { MemberAvatar } from "@/components/Calendar/Events/shared";
import {
  AvailabilitySlotProps,
  SlotActions,
} from "@/components/Calendar/types";
import { Loading, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { Void } from "@litespace/types";
import { Dayjs } from "dayjs";
import { isEmpty } from "lodash";
import React from "react";

const MAX_MEMBERS_COUNT = 3;

export const SlotsList: React.FC<{
  day: Dayjs;
  slots?: AvailabilitySlotProps[];
  slotActions?: SlotActions;
  loading: boolean;
  error: boolean;
  retry: Void;
}> = ({ day, slots = [], slotActions, loading, error, retry }) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loading
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
    <div className="flex flex-col gap-4 mx-auto">
      {slots
        .filter((slot) => dayjs(slot.start).startOf("week").isSame(day))
        .sort((a, b) => (dayjs(a.start).isBefore(dayjs(b.start)) ? -1 : 1)) // -1 ascending order and 1 descending order
        .map((slot) => {
          const remainingMembers = slot.members.length - MAX_MEMBERS_COUNT;
          return (
            <div
              key={slot.id}
              className="relative bg-natural-50 border border-natural-200 rounded-2xl p-4 shadow-slot flex flex-col gap-1"
            >
              <div className="absolute top-4 left-4">
                <OptionsMenu
                  onEdit={() => slotActions?.onEdit && slotActions.onEdit(slot)}
                  onDelete={() =>
                    slotActions?.onDelete && slotActions.onDelete(slot.id)
                  }
                />
              </div>
              <Typography tag="h4" className="text-caption font-bold">
                {dayjs(slot.start).startOf("day").format("dddd D MMMM")}
              </Typography>
              <Typography tag="span" className="text-tiny font-normal">
                {dayjs(slot.start).format("hh:mm a")}
                {" - "}
                {dayjs(slot.end).format("hh:mm a")}
              </Typography>

              {!isEmpty(slot.members) ? (
                <div className="flex mr-4 mt-1">
                  {slot.members
                    .slice(0, MAX_MEMBERS_COUNT)
                    .map((member, idx) => (
                      <div
                        key={idx}
                        className="-mr-4 rounded-full outline outline-1 outline-natural-50 relative z-0"
                      >
                        <MemberAvatar
                          src={member.image}
                          alt={member.name}
                          id={member.id}
                        />
                      </div>
                    ))}

                  {remainingMembers > 0 ? (
                    <div className="w-[35px] h-[35px] -mr-4 rounded-full bg-natural-500 relative z-10 flex justify-center items-center outline outline-1 outline-natural-50">
                      <Typography
                        tag="span"
                        className="text-tiny font-semibold text-natural-50"
                      >
                        {remainingMembers}+
                      </Typography>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
    </div>
  );
};

export default SlotsList;

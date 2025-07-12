import { AvailabilitySlotProps } from "@litespace/ui/Calendar";
import dayjs from "@/lib/dayjs";
import { IAvailabilitySlot } from "@litespace/types";

export const splitSlot = (
  slot: IAvailabilitySlot.Self,
  members: AvailabilitySlotProps["members"]
): AvailabilitySlotProps[] => {
  // NOTE: the front-end doesn't allow users to create
  // slots not contained within a single day. However, this will cover all use cases.
  const endOfSlotDay = dayjs(slot.start).endOf("day");
  const isSlotTrespassing = dayjs(slot.end).isAfter(endOfSlotDay);

  if (!isSlotTrespassing) {
    return [{ ...slot, members }];
  }

  const firstPart = {
    id: slot.id,
    start: slot.start,
    end: endOfSlotDay.add(1, "day").startOf("day").toISOString(),
    members,
  };

  return [
    firstPart,
    ...splitSlot(
      {
        ...slot,
        start: endOfSlotDay.add(1, "day").startOf("day").toISOString(),
      },
      members
    ),
  ];
};

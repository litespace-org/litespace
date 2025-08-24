import { AvailabilitySlotProps } from "@litespace/ui/Calendar";
import dayjs from "@/lib/dayjs";
import { IAvailabilitySlot } from "@litespace/types";

export const divideSlot = (
  slot: IAvailabilitySlot.Self,
  members: AvailabilitySlotProps["members"]
): AvailabilitySlotProps[] => {
  // NOTE: the front-end doesn't allow users to create
  // slots not contained within a single day. However, this will cover all use cases.
  const endOfSlotDay = dayjs(slot.start).endOf("day");
  const startOfNextDay = dayjs(slot.start).add(1, "day").startOf("day");
  const isSlotTrespassing = dayjs(slot.end).isAfter(endOfSlotDay);

  if (!isSlotTrespassing) {
    if (slot.start === slot.end) return [];
    return [{ ...slot, members }];
  }

  const firstPart = {
    id: slot.id,
    start: slot.start,
    end: endOfSlotDay.toISOString(),
    members,
  };

  if (firstPart.start === firstPart.end) return [];

  return [
    firstPart,
    ...divideSlot(
      {
        ...slot,
        start: startOfNextDay.toISOString(),
      },
      members
    ),
  ];
};

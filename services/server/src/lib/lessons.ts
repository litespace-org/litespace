import { asDiscreteSlot, isAvailableSlot, maskCalls } from "@litespace/sol";
import dayjs from "@/lib/dayjs";
import { ISlot, ICall } from "@litespace/types";

export function hasEnoughTime({
  call,
  calls,
  slot,
}: {
  call: { start: string; duration: number };
  calls: ICall.Self[];
  slot: ISlot.Self;
}): boolean {
  const date = dayjs.utc(call.start).startOf("day");
  // const availableSlot = isAvailableSlot(slot, date);
  // if (!availableSlot) return false;

  // const discrateSlot = asDiscreteSlot(slot, date);
  // const subslots = maskCalls(discrateSlot, calls);
  // const start = dayjs(call.start);
  // const end = dayjs(call.start).add(call.duration, "minutes");

  // for (const subslot of subslots) {
  //   const outOfBoundaries =
  //     start.isBefore(subslot.start) || end.isAfter(subslot.end);
  //   if (!outOfBoundaries) return true;
  // }

  return false;
}

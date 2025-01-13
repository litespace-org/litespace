import { IAvailabilitySlot, IInterview, ILesson } from "@litespace/types";
import { dayjs } from "@/dayjs";
import { flatten, orderBy } from "lodash";
import { INTERVIEW_DURATION } from "@/constants";

/**
 * Divide list of slots into sub-slots. It is used whenever a user wants to book a lesson
 * e.g., slot from 8am-10pm, split by 30min => 8-8:30, 8:30-9, 9-9:30, 9:30-10.
 */
export function getSubSlotsBatch(
  /**
   * list of the slots to be divided.
   */
  slots: IAvailabilitySlot.Slot[],
  /**
   * the duration of each subslot in minutes.
   */
  duration: number
): IAvailabilitySlot.SubSlot[] {
  return flatten(slots.map((slot) => getSubSlots(slot, duration)));
}

export function getSubSlots(
  slot: IAvailabilitySlot.Slot,
  duration: number
): IAvailabilitySlot.SubSlot[] {
  let start = dayjs.utc(slot.start);
  let end = start.add(duration, "minutes");
  const subslots: IAvailabilitySlot.SubSlot[] = [];
  while (end.isBefore(dayjs.utc(slot.end)) || end.isSame(dayjs.utc(slot.end))) {
    subslots.push({
      parent: slot.id,
      start: start.toISOString(),
      end: end.toISOString(),
    });
    start = end;
    end = start.add(duration, "minutes");
  }
  return subslots;
}

/**
 * checks if the passed book info can be booked in the given slot.
 */
export function canBook({
  slot,
  bookedSubslots,
  bookInfo,
}: {
  /**
   * the slot to be partailly or fully booked.
   */
  slot: IAvailabilitySlot.Slot;
  /**
   * subslots that are already booked (to be subtracted).
   */
  bookedSubslots: IAvailabilitySlot.SubSlot[];
  /**
   * the time that's needed to be booked.
   */
  bookInfo: {
    /**
     * The new slot `start` as iso-utc datetime.
     */
    start: string;
    /**
     * The new slot duration in minutes.
     */
    duration: number;
  };
}): boolean {
  const availableSubSlots = subtractSlots(slot, bookedSubslots);
  const found = availableSubSlots.find((subslot) =>
    isSuperSlot(subslot, {
      parent: subslot.parent,
      start: dayjs.utc(bookInfo.start).toISOString(),
      end: dayjs
        .utc(bookInfo.start)
        .add(bookInfo.duration, "minutes")
        .toISOString(),
    })
  );
  return !!found;
}

/**
 * removes the booked slots (represented by subslots) from the `slots` and
 * then returns the free remaining space/time represented by subslots.
 */
export function subtractSlotsBatch({
  slots,
  subslots,
}: {
  slots: IAvailabilitySlot.Slot[];
  subslots: IAvailabilitySlot.SubSlot[];
}): IAvailabilitySlot.SubSlot[] {
  const res: IAvailabilitySlot.SubSlot[] = [];
  for (const slot of slots) {
    const filtered = subslots.filter((subslot) => isParent(slot, subslot));
    res.push(
      ...subtractSlots(slot, filtered).map((subslot) => ({
        parent: slot.id,
        start: subslot.start,
        end: subslot.end,
      }))
    );
  }
  return res;
}

export function subtractSlots(
  slot: IAvailabilitySlot.Slot,
  subslots: IAvailabilitySlot.SubSlot[]
): IAvailabilitySlot.SubSlot[] {
  const res: IAvailabilitySlot.SubSlot[] = [];
  const mainSubSlot: IAvailabilitySlot.SubSlot = {
    parent: slot.id,
    start: slot.start,
    end: slot.end,
  };

  for (const subslot of orderSlots(subslots, "asc")) {
    const start = dayjs.utc(mainSubSlot.start);
    const end = dayjs.utc(subslot.start);

    const empty = start.isSame(end);
    if (!empty)
      res.push({
        parent: mainSubSlot.parent,
        start: start.toISOString(),
        end: end.toISOString(),
      });

    mainSubSlot.start = subslot.end;
  }

  const empty = dayjs(mainSubSlot.start).isSame(mainSubSlot.end);
  if (!empty) res.push(mainSubSlot);
  return res;
}

/**
 * checks if a specific slot intersects with at least one slot of the passed list.
 * the boundaries are excluded in the intersection.
 */
export function isIntersecting(
  target: IAvailabilitySlot.GeneralSlot,
  slots: IAvailabilitySlot.GeneralSlot[]
): boolean {
  for (const slot of slots) {
    // target slot started after the current slot.
    const startedAfterCurrentSlot =
      dayjs.utc(target.start).isAfter(slot.end) ||
      dayjs.utc(target.start).isSame(slot.end);
    // target slot eneded before the current slot.
    const endedBeforeCurrentSlot =
      dayjs.utc(target.end).isBefore(slot.start) ||
      dayjs.utc(target.end).isSame(slot.start);
    if (!startedAfterCurrentSlot && !endedBeforeCurrentSlot) return true;
  }
  return false;
}

/**
 *  checks if slot `a` is the parent of subslot `b`.
 */
export function isParent(
  a: IAvailabilitySlot.Slot,
  b: IAvailabilitySlot.SubSlot
): boolean {
  return a.id === b.parent && isSuperSlot(a, b);
}

/**
 *  checks if slot `a` can be considered as a super slot (contains) for slot `b` or not.
 */
export function isSuperSlot(
  a: IAvailabilitySlot.GeneralSlot,
  b: IAvailabilitySlot.GeneralSlot
): boolean {
  return (
    !dayjs.utc(a.start).isAfter(b.start) && !dayjs.utc(a.end).isBefore(b.end)
  );
}

/**
 * immutably orders/sorts a list of slots/subslots.
 */
export function orderSlots(
  slots: IAvailabilitySlot.GeneralSlot[],
  dir: "asc" | "desc"
): IAvailabilitySlot.GeneralSlot[] {
  return orderBy(slots, [(slot) => dayjs.utc(slot.start)], [dir]);
}

export function asSlot<T extends ILesson.Self | IInterview.Self>(
  item: T
): IAvailabilitySlot.Slot {
  return {
    id: "ids" in item ? item.ids.slot : item.slotId,
    start: item.start,
    end: dayjs(item.start)
      .add("duration" in item ? item.duration : INTERVIEW_DURATION)
      .toISOString(),
  };
}

export function asSlots<T extends ILesson.Self | IInterview.Self>(
  items: T[]
): IAvailabilitySlot.Slot[] {
  return items.map((item) => asSlot(item));
}

export function asSubSlot<T extends ILesson.Self | IInterview.Self>(
  item: T
): IAvailabilitySlot.SubSlot {
  return {
    parent: "ids" in item ? item.ids.slot : item.slotId,
    start: item.start,
    end: dayjs(item.start)
      .add("duration" in item ? item.duration : INTERVIEW_DURATION)
      .toISOString(),
  };
}

export function asSubSlots<T extends ILesson.Self | IInterview.Self>(
  items: T[]
): IAvailabilitySlot.SubSlot[] {
  return items.map((item) => asSubSlot(item));
}

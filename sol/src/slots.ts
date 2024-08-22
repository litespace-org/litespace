import zod from "zod";
import { dayjs } from "@/dayjs";
import { cloneDeep, isEmpty } from "lodash";
import { ISlot, ICall } from "@litespace/types";
import { Dayjs } from "dayjs";
import { Time } from "./time";

function isSelectableDailySlot(slot: ISlot.ModifiedSelf, date: Dayjs) {
  const bounded = slot.end !== null;
  const start = dayjs.utc(slot.start);
  const end = dayjs.utc(slot.end);
  const started = start.isBefore(date) || start.isSame(date);
  const eneded = end.isBefore(date) || end.isSame(date);
  return bounded ? started && !eneded : started;
}

function isSelectableWeeklySlot(slot: ISlot.Self, date: Dayjs) {
  const bounded = !!slot.date.end;
  const started = dayjs(slot.date.start).isBefore(date.add(1, "second"));
  const eneded = dayjs(slot.date.end).isBefore(date);
  const between = bounded ? started && !eneded : started;
  return between && date.day() === slot.weekday;
}

/**
 * Range only slot has a start and end date without any repeating.
 */
function isRangeOnlySlot(slot: ISlot.Self): boolean {
  return !!slot.date.end && slot.repeat === ISlot.Repeat.No;
}

function isSelectableRangeSlot(slot: ISlot.Self, date: Dayjs): boolean {
  // range only slot has a start date and end date but no
  const same = date.isSame(slot.date.start) || date.isSame(slot.date.end);
  const between = date.isAfter(slot.date.start) && date.isBefore(slot.date.end);
  return same || between;
}

function selectSlots(
  slots: ISlot.ModifiedSelf[],
  date: Dayjs
): ISlot.ModifiedSelf[] {
  return slots.filter((slot) => {
    // handle window based slots (start-end)
    // const rangeOnlySlot = isRangeOnlySlot(slot);
    // if (rangeOnlySlot) return isSelectableRangeSlot(slot, date);
    // Handle specific slots (no repeat)
    // const noRepeat = slot.repeat === ISlot.Repeat.No;
    // if (noRepeat) return dayjs.utc(slot.date.start).isSame(date);

    // Handle daily slots (bounded & unbounded)
    const daily = slot.repeat === ISlot.Repeat.Daily;
    if (daily) return isSelectableDailySlot(slot, date);

    // Handle weekly slots (bounded & unbounded)
    // const weekly = slot.repeat === ISlot.Repeat.Weekly;
    // if (weekly) return isSelectableWeeklySlot(slot, date);

    return false;
  });
}

export function isAvailableSlot(
  slot: ISlot.ModifiedSelf,
  date: Dayjs
): boolean {
  return !isEmpty(selectSlots([slot], date));
}

export function asDiscreteSlot(
  slot: ISlot.ModifiedSelf,
  date: Dayjs
): ISlot.Discrete[] {
  const slotStart = dayjs.utc(slot.start);
  const day = date.startOf("day");
  const next = day.add(1, "day");
  const time = Time.from(slot.time);
  const discreteSlotStart = day.add(time.totalMinutes(), "minutes");
  const discreteSlotEnd = discreteSlotStart.add(slot.duration, "minutes");

  const shared = {
    id: slot.id,
    userId: slot.userId,
    title: slot.title,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  } as const;

  const started =
    slotStart.isBefore(discreteSlotStart) ||
    slotStart.isSame(discreteSlotStart);
  if (!started) return [];

  const firstDiscreteSlotEnd = discreteSlotEnd.isAfter(next)
    ? next.toISOString()
    : discreteSlotEnd.toISOString();

  const slots: ISlot.Discrete[] = [];

  const first: ISlot.Discrete = {
    ...shared,
    start: discreteSlotStart.toISOString(),
    end: firstDiscreteSlotEnd,
  };

  if (dayjs.utc(slot.end).isAfter(first.end, "minutes"))
    slots.push({
      ...shared,
      start: discreteSlotStart.toISOString(),
      end: firstDiscreteSlotEnd,
    });

  if (
    dayjs.utc(slot.start).isBefore(day) &&
    dayjs.utc(slot.end).isAfter(day) &&
    discreteSlotEnd.isAfter(next)
  ) {
    slots.unshift({
      ...shared,
      start: day.toISOString(),
      end: day
        .add(discreteSlotEnd.diff(next, "minutes"), "minutes")
        .toISOString(),
    });
  }

  return slots;
}

function asMaskedDiscrateSlot(
  slot: ISlot.Discrete,
  start: Dayjs,
  end: Dayjs
): ISlot.Discrete {
  return {
    ...slot,
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function sortSlotCalls(calls: ICall.Self[]): ICall.Self[] {
  return cloneDeep(calls).sort((current: ICall.Self, next: ICall.Self) => {
    if (dayjs(current.start).isSame(next.start))
      throw new Error(
        "Two calls with the same host at the same time, should never happen"
      );

    if (dayjs(current.start).isAfter(next.start)) return 1;
    return -1;
  });
}

export function maskCalls(slot: ISlot.Discrete, calls: ICall.Self[]) {
  const sorted = sortSlotCalls(calls);
  let masked: ISlot.Discrete[] = [];
  let prevSlot = slot;

  for (const call of sorted) {
    //  [ first slot  [ call ]  second slot    ]
    // 4pm           6pm      7pm               10pm
    const firstSlotStart = dayjs(prevSlot.start);
    const firstSlotEnd = dayjs(call.start);

    const secondSlotStart = dayjs(call.start).add(call.duration, "minutes");
    const secondSlotEnd = dayjs(prevSlot.end);

    const firstSlot = asMaskedDiscrateSlot(
      prevSlot,
      firstSlotStart,
      firstSlotEnd
    );

    const secondSlot = asMaskedDiscrateSlot(
      prevSlot,
      secondSlotStart,
      secondSlotEnd
    );

    const emptyFirstSlot = firstSlotStart.isSame(firstSlotEnd);
    if (!emptyFirstSlot) masked.push(firstSlot);

    prevSlot = secondSlot;
  }

  const emptyPrevSlot = dayjs(prevSlot.start).isSame(prevSlot.end);
  if (!emptyPrevSlot) masked.push(prevSlot);
  return masked;
}

export function setDayTime(date: Dayjs, time: Time): Dayjs {
  return date
    .startOf("day")
    .set("hour", time.hours())
    .set("minutes", time.minutes());
}

export function asDayStart(date: Dayjs): Dayjs {
  return dayjs(date.format("YYYY-MM-DD"));
}

export function selectSlotCalls(
  calls: ICall.Self[],
  slot: ISlot.Discrete
): ICall.Self[] {
  return calls.filter((call) => {
    return (
      dayjs.utc(call.start).isBetween(slot.start, slot.end, "minutes", "[]") &&
      slot.id === call.ruleId
    );
  });
}

export function unpackSlots({
  slots,
  calls,
  start = dayjs.utc().format("YYYY-MM-DD"),
  window = 14,
}: {
  slots: ISlot.ModifiedSelf[];
  calls: ICall.Self[];

  start?: string;
  window?: number;
}): Array<{ day: string; slots: ISlot.Discrete[] }> {
  const availableSlots: Array<{ day: string; slots: ISlot.Discrete[] }> = [];

  for (let dayIndex = 0; dayIndex < window; dayIndex++) {
    const day = dayjs.utc(start).add(dayIndex, "day");
    const selected = selectSlots(slots, day);
    const available: ISlot.Discrete[] = [];

    for (const slot of selected) {
      const discreteSlots = asDiscreteSlot(slot, day);
      for (const discreteSlot of discreteSlots) {
        const slotCalls = selectSlotCalls(calls, discreteSlot);
        available.push(...maskCalls(discreteSlot, slotCalls));
      }
    }

    availableSlots.push({
      day: day.format("YYYY-MM-DD"),
      slots: available,
    });
  }

  return availableSlots;
}

export function splitSlot<T extends { start: string; end: string }>(
  slot: T,
  duration: number = 30
): T[] {
  const list: T[] = [];
  let start = dayjs.utc(slot.start);

  while (true) {
    const end = start.add(duration, "minutes");
    if (end.isAfter(slot.end)) break;

    list.push({
      ...slot,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    start = end;
  }

  return list;
}

import { Dayjs } from "dayjs";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import { Slot } from "@/database";
import { Lesson } from "@/database";
import { cloneDeep, isEmpty } from "lodash";

type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

export function asTimeValues(input: string): Time {
  const time = zod
    .string()
    .time({ message: `"${input}" is not a valid time` })
    .parse(input);

  const [hours, minutes, seconds] = time.split(":");

  return {
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
  };
}

function isSelectableDailySlot(slot: Slot.Self, date: Dayjs) {
  const bounded = !!slot.date.end;
  const started = dayjs(slot.date.start).isBefore(date.add(1, "second"));
  const eneded = dayjs(slot.date.end).isBefore(date);
  return bounded ? started && !eneded : started;
}

function isSelectableWeeklySlot(slot: Slot.Self, date: Dayjs) {
  const bounded = !!slot.date.end;
  const started = dayjs(slot.date.start).isBefore(date.add(1, "second"));
  const eneded = dayjs(slot.date.end).isBefore(date);
  const between = bounded ? started && !eneded : started;
  return between && date.day() === slot.weekday;
}

function selectSlots(slots: Slot.Self[], date: Dayjs) {
  return slots.filter((slot) => {
    // Handle specific slots (no repeat)
    const noRepeat = slot.repeat === Slot.Repeat.NoRepeat;
    if (noRepeat) return dayjs(slot.date.start).isSame(date);

    // Handle daily slots (bounded & unbounded)
    const daily = slot.repeat === Slot.Repeat.Daily;
    if (daily) return isSelectableDailySlot(slot, date);

    // Handle weekly slots (bounded & unbounded)
    const weekly = slot.repeat === Slot.Repeat.EveryWeek;
    if (weekly) return isSelectableWeeklySlot(slot, date);

    return false;
  });
}

function asDiscrateSlot(slot: Slot.Self, date: Dayjs): Slot.Discrete {
  const start = asTimeValues(slot.time.start);
  const end = asTimeValues(slot.time.end);
  const exactStartTime = setDayTime(date, start);
  const exactEndTime = setDayTime(date, end);

  return {
    id: slot.id,
    tutorId: slot.tutorId,
    title: slot.title,
    description: slot.description,
    start: exactStartTime.toISOString(),
    end: exactEndTime.toISOString(),
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
}

function asMaskedDiscrateSlot(
  slot: Slot.Discrete,
  start: Dayjs,
  end: Dayjs
): Slot.Discrete {
  return {
    ...slot,
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function sortSlotLessons(lessons: Lesson.Self[]): Lesson.Self[] {
  return cloneDeep(lessons).sort((current: Lesson.Self, next: Lesson.Self) => {
    if (dayjs(current.start).isSame(next.start))
      throw new Error(
        "Two lessons with the same tutor at the same time, should never happen"
      );

    if (dayjs(current.start).isAfter(next.start)) return 1;
    return -1;
  });
}

function maskLessons(slot: Slot.Discrete, lessons: Lesson.Self[]) {
  const sorted = sortSlotLessons(lessons);
  let masked: Slot.Discrete[] = [];
  let prevSlot = slot;

  for (const lesson of sorted) {
    //  [ first slot  [ lesson ]  second slot    ]
    // 4pm           6pm      7pm               10pm
    const firstSlotStart = dayjs(prevSlot.start);
    const firstSlotEnd = dayjs(lesson.start);

    const secondSlotStart = dayjs(lesson.start).add(lesson.duration, "minutes");
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
    // const emptySecondSlot = secondSlotStart.isSame(secondSlotEnd);

    if (!emptyFirstSlot) masked.push(firstSlot);
    // if (!emptySecondSlot) masked.push(secondSlot);

    prevSlot = secondSlot;
  }

  const emptyPrevSlot = dayjs(prevSlot.start).isSame(prevSlot.end);
  if (!emptyPrevSlot) masked.push(prevSlot);
  return masked;
}

export function setDayTime(date: Dayjs, time: Time): Dayjs {
  return date
    .set("hours", time.hours)
    .set("minutes", time.minutes)
    .set("seconds", time.seconds)
    .set("milliseconds", 0);
}

export function unpackSlots(
  slots: Slot.Self[],
  lessons: Lesson.Self[]
): Array<{ day: string; slots: Slot.Discrete[] }> {
  const today = setDayTime(dayjs().utc(), { hours: 0, minutes: 0, seconds: 0 });
  const availableSlots: Array<{ day: string; slots: Slot.Discrete[] }> = [];

  for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
    const day = today.add(dayIndex, "day");
    const selected = selectSlots(slots, day);

    const available: Slot.Discrete[] = [];

    for (const slot of selected) {
      const slotLessons = lessons.filter((lesson) => lesson.slotId === slot.id);
      const discreteSlot = asDiscrateSlot(slot, day);
      available.push(...maskLessons(discreteSlot, slotLessons));
    }

    availableSlots.push({
      day: day.toISOString(),
      slots: available,
    });
  }

  return availableSlots;
}

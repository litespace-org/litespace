import { Dayjs } from "dayjs";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import { cloneDeep, isEmpty } from "lodash";
import { ISlot, ILesson } from "@litespace/types";

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

function isSelectableDailySlot(slot: ISlot.Self, date: Dayjs) {
  const bounded = !!slot.date.end;
  const started = dayjs(slot.date.start).isBefore(date.add(1, "second"));
  const eneded = dayjs(slot.date.end).isBefore(date);
  return bounded ? started && !eneded : started;
}

function isSelectableWeeklySlot(slot: ISlot.Self, date: Dayjs) {
  const bounded = !!slot.date.end;
  const started = dayjs(slot.date.start).isBefore(date.add(1, "second"));
  const eneded = dayjs(slot.date.end).isBefore(date);
  const between = bounded ? started && !eneded : started;
  return between && date.day() === slot.weekday;
}

function selectSlots(slots: ISlot.Self[], date: Dayjs): ISlot.Self[] {
  return slots.filter((slot) => {
    // Handle specific slots (no repeat)
    const noRepeat = slot.repeat === ISlot.Repeat.No;
    if (noRepeat) return dayjs(slot.date.start).isSame(date);

    // Handle daily slots (bounded & unbounded)
    const daily = slot.repeat === ISlot.Repeat.Daily;
    if (daily) return isSelectableDailySlot(slot, date);

    // Handle weekly slots (bounded & unbounded)
    const weekly = slot.repeat === ISlot.Repeat.Weekly;
    if (weekly) return isSelectableWeeklySlot(slot, date);

    return false;
  });
}

export function isAvailableSlot(slot: ISlot.Self, date: Dayjs): boolean {
  return !isEmpty(selectSlots([slot], date));
}

export function asDiscrateSlot(slot: ISlot.Self, date: Dayjs): ISlot.Discrete {
  const start = asTimeValues(slot.time.start);
  const end = asTimeValues(slot.time.end);
  const exactStartTime = setDayTime(date, start);
  const exactEndTime = setDayTime(date, end);

  return {
    id: slot.id,
    tutorId: slot.tutorId,
    title: slot.title,
    start: exactStartTime.toISOString(),
    end: exactEndTime.toISOString(),
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
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

function sortSlotLessons(lessons: ILesson.Self[]): ILesson.Self[] {
  return cloneDeep(lessons).sort(
    (current: ILesson.Self, next: ILesson.Self) => {
      if (dayjs(current.start).isSame(next.start))
        throw new Error(
          "Two lessons with the same tutor at the same time, should never happen"
        );

      if (dayjs(current.start).isAfter(next.start)) return 1;
      return -1;
    }
  );
}

export function maskLessons(slot: ISlot.Discrete, lessons: ILesson.Self[]) {
  const sorted = sortSlotLessons(lessons);
  let masked: ISlot.Discrete[] = [];
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
    if (!emptyFirstSlot) masked.push(firstSlot);

    prevSlot = secondSlot;
  }

  const emptyPrevSlot = dayjs(prevSlot.start).isSame(prevSlot.end);
  if (!emptyPrevSlot) masked.push(prevSlot);
  return masked;
}

export function setDayTime(
  date: Dayjs,
  time: Time = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }
): Dayjs {
  return date
    .set("hours", time.hours)
    .set("minutes", time.minutes)
    .set("seconds", time.seconds)
    .set("milliseconds", 0);
}

export function asDayStart(date: Dayjs): Dayjs {
  return dayjs(date.format("YYYY-MM-DD"));
}

export function unpackSlots(
  slots: ISlot.Self[],
  lessons: ILesson.Self[]
): Array<{ day: string; slots: ISlot.Discrete[] }> {
  const today = setDayTime(dayjs().utc());
  const availableSlots: Array<{ day: string; slots: ISlot.Discrete[] }> = [];

  for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
    const day = today.add(dayIndex, "day");
    const selected = selectSlots(slots, day);

    const available: ISlot.Discrete[] = [];

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

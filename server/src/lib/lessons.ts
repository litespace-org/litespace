import {
  asDiscrateSlot,
  isAvailableSlot,
  maskLessons,
  setDayTime,
} from "@/lib/slots";
import dayjs from "@/lib/dayjs";
import { ISlot, ILesson } from "@litespace/types";

export function hasEnoughTime({
  lesson,
  lessons,
  slot,
}: {
  lesson: { start: string; duration: number };
  lessons: ILesson.Self[];
  slot: ISlot.Self;
}): boolean {
  const date = setDayTime(dayjs(lesson.start).utc());
  const availableSlot = isAvailableSlot(slot, date);
  if (!availableSlot) return false;

  const discrateSlot = asDiscrateSlot(slot, date);
  const subslots = maskLessons(discrateSlot, lessons);
  const start = dayjs(lesson.start);
  const end = dayjs(lesson.start).add(lesson.duration, "minutes");

  for (const subslot of subslots) {
    const outOfBoundaries =
      start.isBefore(subslot.start) || end.isAfter(subslot.end);
    if (!outOfBoundaries) return true;
  }

  return false;
}

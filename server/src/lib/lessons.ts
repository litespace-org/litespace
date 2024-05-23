import { Lesson, Slot } from "@/database";
import {
  asDiscrateSlot,
  isAvailableSlot,
  maskLessons,
  setDayTime,
} from "@/lib/slots";
import dayjs from "@/lib/dayjs";

export function hasEnoughTime({
  lesson,
  lessons,
  slot,
}: {
  lesson: { start: string; duration: number };
  lessons: Lesson.Self[];
  slot: Slot.Self;
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

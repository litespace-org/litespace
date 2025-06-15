import { ILesson } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { DayLessonsMap } from "@/types/lesson";
import { sum } from "lodash";

export function getDayLessonsMap(lessons: Array<ILesson.Self>): DayLessonsMap {
  const dayLessonsMap: DayLessonsMap = {};

  for (const lesson of lessons) {
    const day = dayjs(lesson.start).format("YYYY-MM-DD");
    if (!dayLessonsMap[day]) {
      dayLessonsMap[day] = { paid: [], free: [] };
    }
    if (lesson.price > 0) dayLessonsMap[day].paid.push(lesson);
    else dayLessonsMap[day].free.push(lesson);
  }

  return dayLessonsMap;
}

export function inflateDayLessonsMap(map: DayLessonsMap) {
  const inflatted = [];

  for (const day in map) {
    const paidLessons = map[day].paid;
    const freeLessons = map[day].free;
    inflatted.push({
      date: day,
      paidLessonCount: paidLessons.length,
      paidTutoringMinutes: sum(paidLessons.map((l) => l.duration)) || 0,
      freeLessonCount: freeLessons.length,
      freeTutoringMinutes: sum(freeLessons.map((l) => l.duration)) || 0,
    });
  }

  return inflatted;
}

import { ILesson } from "@litespace/types";

export type DayLessonsMap = Record<
  string,
  {
    paid: Array<ILesson.Self>;
    free: Array<ILesson.Self>;
  }
>;

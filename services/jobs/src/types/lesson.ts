import { ILesson } from "@litespace/types";

export type LessonData = {
  lessons: ILesson.Self[];
  lessonMembers: ILesson.PopuldatedMember[];
};

export type ValidLessonMember = ILesson.PopuldatedMember & {
  phone: string;
};

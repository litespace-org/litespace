import { Base } from "@/base";
import { IFilter, ILesson } from "@litespace/types";

export class Lesson extends Base {
  async create(
    payload: ILesson.CreateApiPayload
  ): Promise<ILesson.CreateLessonApiResponse> {
    return this.post(`/api/v1/lesson/`, payload);
  }

  async findLessons(
    query: ILesson.FindLessonsApiQuery
  ): Promise<ILesson.FindUserLessonsApiResponse> {
    return this.get(`/api/v1/lesson/list/`, {}, query);
  }

  async cancel(id: number) {
    return this.del(`/api/v1/lesson/${id}`);
  }
}

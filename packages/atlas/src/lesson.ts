import { Base } from "@/base";
import { IFilter, ILesson } from "@litespace/types";

export class Lesson extends Base {
  async create(
    payload: ILesson.CreateApiPayload
  ): Promise<ILesson.CreateApiResponse> {
    return this.post(`/api/v1/lesson/`, payload);
  }

  async findLessons(
    query: ILesson.FindLessonsApiQuery
  ): Promise<ILesson.FindUserLessonsApiResponse> {
    return this.get(`/api/v1/lesson/list/`, null, query);
  }

  async cancel(id: number) {
    return this.del(`/api/v1/lesson/${id}`);
  }
}

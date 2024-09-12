import { Base } from "@/base";
import { IFilter, ILesson } from "@litespace/types";

export class Lesson extends Base {
  async create(
    payload: ILesson.CreateApiPayload
  ): Promise<ILesson.CreateApiResponse> {
    return this.post(`/api/v1/lesson/`, payload);
  }

  async findUserLessons(
    id: number,
    pagnation?: IFilter.Pagination
  ): Promise<ILesson.FindUserLessonsApiResponse> {
    return this.get(`/api/v1/lesson/list/${id}`, null, pagnation);
  }

  async cancel(id: number) {
    return this.del(`/api/v1/lesson/${id}`);
  }
}

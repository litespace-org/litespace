import { Base } from "@/lib/base";
import { ILesson } from "@litespace/types";

export class Lesson extends Base {
  async create(
    payload: ILesson.CreateApiPayload
  ): Promise<ILesson.CreateLessonApiResponse> {
    return this.post({
      route: `/api/v1/lesson/`,
      payload,
    });
  }

  async findLessons(
    query: ILesson.FindLessonsApiQuery
  ): Promise<ILesson.FindUserLessonsApiResponse> {
    return this.get({
      route: `/api/v1/lesson/list/`,
      params: query,
    });
  }

  async findLesson(id: number): Promise<ILesson.FindLessonByIdApiResponse> {
    return await this.get({ route: `/api/v1/lesson/${id}` });
  }

  async update(
    payload: ILesson.UpdateApiPayload
  ): Promise<ILesson.UpdateLessonApiResponse> {
    return await this.patch({ route: `/api/v1/lesson`, payload });
  }

  async cancel(id: number): Promise<void> {
    return this.del({ route: `/api/v1/lesson/${id}` });
  }
}

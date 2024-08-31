import { Base } from "@/base";
import { ILesson } from "@litespace/types";

export class Lesson extends Base {
  async create(
    payload: ILesson.CreateApiPayload
  ): Promise<ILesson.CreateApiResponse> {
    return this.post(`/api/v1/lesson/`, payload);
  }

  async cancel(id: number) {
    return this.del(`/api/v1/lesson/${id}`);
  }
}

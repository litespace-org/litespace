import { Base } from "@/lib/base";
import { IStudent } from "@litespace/types";

export class Student extends Base {
  async create(
    payload: IStudent.CreateApiPayload
  ): Promise<IStudent.CreateApiResponse> {
    return this.post({ route: "/api/v1/student/", payload });
  }

  async update(
    id: number,
    payload: IStudent.UpdateApiPayload
  ): Promise<IStudent.Self> {
    return this.put({ route: `/api/v1/student/${id}`, payload });
  }
}

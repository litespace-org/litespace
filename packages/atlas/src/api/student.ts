import { Base } from "@/lib/base";
import { IStudent } from "@litespace/types";

export class Student extends Base {
  async create(
    payload: IStudent.CreateApiPayload
  ): Promise<IStudent.CreateApiResponse> {
    return this.post({ route: "/api/v1/student/", payload });
  }

  async update(
    payload: IStudent.UpdateApiPayload
  ): Promise<IStudent.UpdateApiResponse> {
    return this.patch({ route: `/api/v1/student/`, payload });
  }

  async findById(
    query: IStudent.FindByIdApiQuery
  ): Promise<IStudent.FindByIdApiResponse> {
    return this.get({ route: `api/v1/student/${query.id}` });
  }

  async sendAdMessage(
    payload: IStudent.SendAdMessageApiPayload
  ): Promise<IStudent.SendAdMessageApiResponse> {
    return this.post({ route: `api/v1/student/send-ad-message`, payload });
  }
}

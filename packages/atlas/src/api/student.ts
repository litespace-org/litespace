import { Base } from "@/lib/base";
import { IStudent } from "@litespace/types";

export class Student extends Base {
  async create(
    payload: IStudent.CreateApiPayload
  ): Promise<IStudent.CreateApiResponse> {
    return this.post({ route: "/api/v1/students", payload });
  }

  async find(
    query?: IStudent.FindModelQuery
  ): Promise<IStudent.FindApiResponse> {
    return this.get({ route: "/api/v1/students/list", params: query });
  }
}

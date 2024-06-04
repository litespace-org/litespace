import { Base } from "@/base";
import {
  RegisterStudentPayload,
  RegisterStudentResponse,
} from "@litespace/types";

export class Student extends Base {
  async register(
    payload: RegisterStudentPayload
  ): Promise<RegisterStudentResponse> {
    const { data } = await this.client.post<RegisterStudentResponse>(
      "/api/v1/student",
      JSON.stringify(payload)
    );

    return data;
  }
}

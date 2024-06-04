import { Base } from "@/base";
import {
  RegisterTutorPayload,
  RegisterTutorResponse,
  TutorsList,
} from "@litespace/types";

export class Tutor extends Base {
  async register(
    payload: RegisterTutorPayload
  ): Promise<RegisterTutorResponse> {
    const { data } = await this.client.post<RegisterTutorResponse>(
      "/api/v1/tutor",
      JSON.stringify(payload)
    );

    return data;
  }

  async findAll(): Promise<TutorsList> {
    return await this.client
      .get<TutorsList>("/api/v1/tutor/list")
      .then((response) => response.data);
  }
}

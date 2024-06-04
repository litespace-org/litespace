import { Base } from "@/base";
import { FindMeResponse, UpdateUserPayload } from "@litespace/types";

export class User extends Base {
  async findMe(): Promise<FindMeResponse> {
    return await this.client
      .get<FindMeResponse>("/api/v1/user/me")
      .then((response) => response.data);
  }

  async update(payload: UpdateUserPayload): Promise<void> {
    await this.client.put("/api/v1/user", JSON.stringify(payload));
  }
}

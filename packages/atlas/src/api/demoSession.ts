import { Base } from "@/lib/base";
import { IDemoSession } from "@litespace/types";

export class DemoSession extends Base {
  async find(
    params: IDemoSession.FindApiQuery
  ): Promise<IDemoSession.FindApiResponse> {
    return this.get({ route: "/api/v1/demo-session/list", params });
  }

  async create(
    payload: IDemoSession.CreateApiPayload
  ): Promise<IDemoSession.CreateApiResponse> {
    return this.post({
      route: "/api/v1/demo-session",
      payload,
    });
  }

  async update(
    payload: IDemoSession.UpdateApiPayload
  ): Promise<IDemoSession.UpdateApiResponse> {
    return await this.patch({
      route: "/api/v1/demo-session",
      payload,
    });
  }
}

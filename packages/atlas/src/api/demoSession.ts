import { Base } from "@/lib/base";
import { IDemoSession } from "@litespace/types";

export class DemoSession extends Base {
  async find(
    query: IDemoSession.FindApiQuery
  ): Promise<IDemoSession.FindApiResponse> {
    return await this.get({
      route: "/api/v1/demo-session/list/",
      params: query,
    });
  }
}

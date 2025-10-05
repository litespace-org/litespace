import { Base } from "@/lib/base";
import { ISessionEvent } from "@litespace/types";

export class SessionEvent extends Base {
  async find(
    query: ISessionEvent.FindApiQuery
  ): Promise<ISessionEvent.FindApiResponse> {
    return await this.get({
      route: `/api/v1/session-event/list`,
      params: query,
    });
  }
}

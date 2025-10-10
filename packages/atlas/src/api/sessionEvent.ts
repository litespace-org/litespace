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

  async findBySessionId({
    sessionId,
  }: ISessionEvent.FindBySessionIdApiQuery): Promise<ISessionEvent.FindBySessionIdApiResponse> {
    return await this.get({
      route: `/api/v1/session-event/list/session/${sessionId}`,
    });
  }
}

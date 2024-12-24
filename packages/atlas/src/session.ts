import { Base } from "@/base";
import { ISession } from "@litespace/types";

export class Session extends Base {
  async findUserSessions(userId: number): Promise<ISession.FindUserSessionsApiResponse> {
    return await this.get({ route: `/api/v1/session/list/user/${userId}` });
  }

  async findSessionMembers(sessionId: string): Promise<ISession.FindSessionMembersApiResponse> {
    return await this.get({ route: `/api/v1/session/${sessionId}/members` });
  }
}

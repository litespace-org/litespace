import { Base } from "@/lib/base";
import { ISession } from "@litespace/types";

export class Session extends Base {
  async findMembers(
    sessionId: ISession.Id
  ): Promise<ISession.FindSessionMembersApiResponse> {
    return await this.get({ route: `/api/v1/session/${sessionId}` });
  }
}

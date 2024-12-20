import { Base } from "@/base";
import { ICall } from "@litespace/types";

export class Call extends Base {
  async findUserCalls(id: number): Promise<ICall.FindUserCallsApiResponse> {
    return await this.get({ route: `/api/v1/call/list/user/${id}` });
  }

  async findById(id: number): Promise<ICall.FindCallByIdApiResponse> {
    return await this.get({ route: `/api/v1/call/${id}` });
  }

  async findCallMembers(
    id: number,
    type: ICall.Type
  ): Promise<ICall.FindCallMembersApiResponse> {
    return await this.get({ route: `/api/v1/call/${id}/${type}/members` });
  }
}

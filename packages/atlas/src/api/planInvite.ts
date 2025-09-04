import { Base } from "@/lib/base";
import { IPlanInvites } from "@litespace/types";

export class PlanInvite extends Base {
  async find(
    query?: IPlanInvites.FindApiQuery
  ): Promise<IPlanInvites.FindApiResponse> {
    return await this.get({ route: `/api/v1/plan-invite/list`, params: query });
  }

  async create(
    payload: IPlanInvites.CreateApiPayload
  ): Promise<IPlanInvites.CreateApiResponse> {
    return await this.post({ route: "/api/v1/plan-invite", payload });
  }

  async update(
    payload: IPlanInvites.UpdateApiPayload
  ): Promise<IPlanInvites.UpdateApiResponse> {
    return await this.patch({ route: `/api/v1/plan-invite`, payload });
  }

  async delete(id: number) {
    await this.del({ route: `/api/v1/plan-invite/${id}` });
  }
}

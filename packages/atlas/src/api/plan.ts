import { Base } from "@/lib/base";
import { IPlan } from "@litespace/types";

export class Plan extends Base {
  async create(payload: IPlan.CreateApiPayload): Promise<void> {
    await this.post({ route: "/api/v1/plan", payload });
  }

  async update(id: number, payload: IPlan.UpdateApiPayload) {
    await this.patch({ route: `/api/v1/plan/${id}`, payload });
  }

  async delete(id: number) {
    await this.del({ route: `/api/v1/plan/${id}` });
  }

  async findById(id: number): Promise<IPlan.Self> {
    return this.get({ route: `/api/v1/plan/${id}` });
  }

  async find(query?: IPlan.FindApiQuery): Promise<IPlan.FindApiResponse> {
    return this.get({ route: `/api/v1/plan/list`, params: query });
  }

  async checkout(
    payload: IPlan.CheckoutPayload
  ): Promise<IPlan.CheckoutResponse> {
    return this.post({ route: `/api/v1/plan/checkout`, payload });
  }
}

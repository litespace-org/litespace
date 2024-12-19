import { Base } from "@/base";
import { IFilter, IPlan } from "@litespace/types";

export class Plan extends Base {
  async create(payload: IPlan.CreateApiPayload): Promise<void> {
    await this.post({ route: "/api/v1/plan", payload });
  }

  async update(id: number, payload: IPlan.UpdateApiPayload) {
    await this.put({ route: `/api/v1/plan/${id}`, payload });
  }

  async delete(id: number) {
    await this.del({ route: `/api/v1/plan/${id}` });
  }

  async findById(id: number): Promise<IPlan.Self> {
    return this.get({ route: `/api/v1/plan/${id}` });
  }

  async find(
    pagination?: IFilter.Pagination
  ): Promise<IPlan.FindPlansApiResponse> {
    return this.get({ route: `/api/v1/plan/list`, params: pagination });
  }
}

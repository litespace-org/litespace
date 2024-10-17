import { Base } from "@/base";
import { IFilter, IPlan } from "@litespace/types";

export class Plan extends Base {
  async create(payload: IPlan.CreateApiPayload): Promise<void> {
    await this.post("/api/v1/plan", payload);
  }

  async update(id: number, payload: IPlan.UpdateApiPayload) {
    await this.put(`/api/v1/plan/${id}`, payload);
  }

  async delete(id: number) {
    await this.del(`/api/v1/plan/${id}`);
  }

  async findById(id: number): Promise<IPlan.Self> {
    return this.get(`/api/v1/plan/${id}`);
  }

  async find(
    pagination?: IFilter.Pagination
  ): Promise<IPlan.FindPlansApiResponse> {
    return this.get(`/api/v1/plan/list`, null, pagination);
  }
}

import { Base } from "@/base";
import { IPlan } from "@litespace/types";

export class Plan extends Base {
  async create(payload: IPlan.CreateApiPayload): Promise<void> {
    await this.client.post("/api/v1/plan", JSON.stringify(payload));
  }

  async update(id: number, payload: IPlan.UpdateApiPayload) {
    await this.client.put(`/api/v1/plan/${id}`, JSON.stringify(payload));
  }

  async delete(id: number) {
    await this.client.delete(`/api/v1/plan/${id}`);
  }

  async findById(id: number): Promise<IPlan.MappedAttributes> {
    return this.client
      .get<IPlan.MappedAttributes>(`/api/v1/plan/${id}`)
      .then((response) => response.data);
  }

  async findAll(): Promise<IPlan.MappedAttributes[]> {
    return this.client
      .get<IPlan.MappedAttributes[]>(`/api/v1/plan/list`)
      .then((response) => response.data);
  }
}

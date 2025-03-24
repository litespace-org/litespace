import { Base } from "@/lib/base";
import { IInvite } from "@litespace/types";

export class Invite extends Base {
  async create(payload: IInvite.CreateApiPayload): Promise<IInvite.Self> {
    return this.client
      .post<IInvite.Self>(`/api/v1/invite`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async update(
    id: number,
    payload: IInvite.UpdateApiPayload
  ): Promise<IInvite.Self> {
    return this.client
      .put<IInvite.Self>(`/api/v1/invite/${id}`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/v1/invite/${id}`);
  }

  async findById(id: number): Promise<IInvite.MappedAttributes> {
    return this.client
      .get<IInvite.MappedAttributes>(`/api/v1/invite/${id}`)
      .then((response) => response.data);
  }

  async findAll(): Promise<IInvite.MappedAttributes[]> {
    return this.client
      .get<IInvite.MappedAttributes[]>(`/api/v1/invite/list`)
      .then((response) => response.data);
  }
}

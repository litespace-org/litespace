import { Base } from "@/base";
import { ISlot, UpdateSlotParams } from "@litespace/types";

export class Slot extends Base {
  async create(payload: ISlot.CreateApiPayload) {
    await this.client.post("/api/v1/slot", JSON.stringify(payload));
  }

  async findById(id: number): Promise<ISlot.Self> {
    return await this.client
      .get<ISlot.Self>(`/api/v1/slot/${id}`)
      .then((response) => response.data);
  }

  async update(id: number, params: UpdateSlotParams) {
    await this.client.put(`/api/v1/slot/${id}`, JSON.stringify(params));
  }

  async delete(id: number) {
    await this.client.delete(`/api/v1/slot/${id}`);
  }

  async findDiscreteTimeSlots(
    userId: number,
    filter?: ISlot.SlotFilter
  ): Promise<ISlot.Unpacked[]> {
    return this.get(`/api/v1/slot/list/discrete/${userId}`, null, filter);
  }

  async findMySlots(): Promise<ISlot.Self[]> {
    return await this.client
      .get("/api/v1/slot/list")
      .then((response) => response.data);
  }
}

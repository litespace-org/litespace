import { Base } from "@/base";
import { ISlot, UpdateSlotParams } from "@litespace/types";

export class Slot extends Base {
  async create(
    params: Omit<ISlot.Self, "id" | "tutorId" | "createdAt" | "updatedAt">
  ) {
    await this.client.post("/api/v1/slot", JSON.stringify(params));
  }

  async update(id: number, params: UpdateSlotParams) {
    await this.client.put(`/api/v1/slot/${id}`, JSON.stringify(params));
  }

  async delete(id: number) {
    await this.client.delete(`/api/v1/slot/${id}`);
  }

  async findMySlots(): Promise<ISlot.Self[]> {
    return await this.client
      .get("/api/v1/slot/list")
      .then((response) => response.data);
  }
}

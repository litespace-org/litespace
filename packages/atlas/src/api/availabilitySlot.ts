import { Base } from "@/lib/base";
import { IAvailabilitySlot } from "@litespace/types";

export class AvailabilitySlot extends Base {
  async find(
    params: IAvailabilitySlot.FindAvailabilitySlotsApiQuery
  ): Promise<IAvailabilitySlot.FindAvailabilitySlotsApiResponse> {
    return await this.get({
      route: `/api/v1/availability-slot/`,
      params,
    });
  }

  async set(payload: IAvailabilitySlot.SetAvailabilitySlotsApiPayload) {
    return await this.post({
      route: `/api/v1/availability-slot/`,
      payload,
    });
  }
}

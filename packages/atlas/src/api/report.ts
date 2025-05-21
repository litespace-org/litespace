import { Base } from "@/lib/base";
import { IReport, Paginated } from "@litespace/types";

export class Report extends Base {
  async create(payload: IReport.CreateApiPayload): Promise<void> {
    return this.client
      .post(`/api/v1/report`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async update(id: number, payload: IReport.UpdateApiPayload): Promise<void> {
    return this.client
      .put(`/api/v1/report/${id}`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async find(): Promise<Paginated<IReport.Self>> {
    return this.client
      .get(`/api/v1/report/list`)
      .then((response) => response.data);
  }
}

import { Base } from "@/base";
import { IReport } from "@litespace/types";

export class Report extends Base {
  async create(payload: IReport.CreateApiPayload): Promise<IReport.Self> {
    return this.client
      .post<IReport.Self>(`/api/v1/report`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async update(
    id: number,
    payload: IReport.UpdateApiPayload
  ): Promise<IReport.Self> {
    return this.client
      .put<IReport.Self>(`/api/v1/report/${id}`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/v1/report/${id}`);
  }

  async findById(id: number): Promise<IReport.MappedAttributes> {
    return this.client
      .get<IReport.MappedAttributes>(`/api/v1/report/${id}`)
      .then((response) => response.data);
  }

  async findAll(): Promise<IReport.MappedAttributes[]> {
    return this.client
      .get<IReport.MappedAttributes[]>(`/api/v1/report/list`)
      .then((response) => response.data);
  }
}

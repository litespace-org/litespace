import { Base } from "@/base";
import { IReportReply } from "@litespace/types";

export class ReportReply extends Base {
  async create(
    payload: IReportReply.CreateApiPayload
  ): Promise<IReportReply.Self> {
    return this.client
      .post<IReportReply.Self>(`/api/v1/report/reply`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async update(
    id: number,
    payload: IReportReply.UpdateApiPayload
  ): Promise<IReportReply.Self> {
    return this.client
      .put<IReportReply.Self>(
        `/api/v1/report/reply/${id}`,
        JSON.stringify(payload)
      )
      .then((response) => response.data);
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/v1/report/reply/${id}`);
  }

  async findById(id: number): Promise<IReportReply.MappedAttributes> {
    return this.client
      .get<IReportReply.MappedAttributes>(`/api/v1/report/reply/${id}`)
      .then((response) => response.data);
  }

  async findAll(): Promise<IReportReply.MappedAttributes[]> {
    return this.client
      .get<IReportReply.MappedAttributes[]>(`/api/v1/report/reply/list`)
      .then((response) => response.data);
  }
}

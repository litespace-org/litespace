import { Base } from "@/lib/base";
import { IReport, Paginated } from "@litespace/types";

export class Report extends Base {
  async create(payload: IReport.CreateApiPayload): Promise<void> {
    return this.post({ route: "/api/v1/report", payload });
  }

  async update(id: number, payload: IReport.UpdateApiPayload): Promise<void> {
    return this.put({ route: `/api/v1/report/${id}`, payload });
  }

  async find(): Promise<Paginated<IReport.Self>> {
    return this.get({ route: "/api/v1/report/list" });
  }
}

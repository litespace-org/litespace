import { Base } from "@/lib/base";
import { IReport } from "@litespace/types";

export class Report extends Base {
  async create(payload: IReport.CreateApiPayload): Promise<void> {
    return this.post({ route: "/api/v1/report", payload });
  }

  async update(payload: IReport.UpdateApiPayload): Promise<void> {
    return this.put({ route: `/api/v1/report`, payload });
  }

  async find(
    payload: IReport.FindApiPayload
  ): Promise<IReport.FindApiResponse> {
    return this.get({ route: "/api/v1/report/list", payload });
  }
}

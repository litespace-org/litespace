import { Base } from "@/lib/base";
import { asFormData } from "@/lib/form";
import { IReport } from "@litespace/types";

export class Report extends Base {
  async create(
    payload: IReport.CreateApiPayload & IReport.CreateApiFiles
  ): Promise<void> {
    return this.post({ route: "/api/v1/report", payload: asFormData(payload) });
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

import { Base } from "@/lib/base";
import { IInterview } from "@litespace/types";

export class Interview extends Base {
  public async create(
    payload: IInterview.CreateApiPayload
  ): Promise<IInterview.CreateApiResponse> {
    return await this.post({
      route: `/api/v1/interview`,
      payload,
    });
  }

  public async update(
    payload: IInterview.UpdateApiPayload
  ): Promise<IInterview.UpdateApiResponse> {
    return await this.patch({
      route: `/api/v1/interview`,
      payload,
    });
  }

  public async find(
    query: IInterview.FindApiQuery
  ): Promise<IInterview.FindApiResponse> {
    return this.get({
      route: "/api/v1/interview/list/",
      params: query,
    });
  }

  public async selectInterviewer(): Promise<IInterview.SelectInterviewerApiResponse> {
    return this.get({ route: "/api/v1/interview/select" });
  }
}

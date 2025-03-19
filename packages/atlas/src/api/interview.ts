import { Base } from "@/lib/base";
import { IInterview } from "@litespace/types";

export class Interview extends Base {
  public async create(
    payload: IInterview.CreateApiPayload
  ): Promise<IInterview.Self> {
    return await this.post({
      route: `/api/v1/interview`,
      payload,
    });
  }

  public async update(
    id: number,
    payload: IInterview.UpdateApiPayload
  ): Promise<IInterview.Self> {
    return await this.put({
      route: `/api/v1/interview/${id}`,
      payload,
    });
  }

  public async findInterviews(
    query: IInterview.FindInterviewsApiQuery
  ): Promise<IInterview.FindInterviewsApiResponse> {
    return this.get({
      route: "/api/v1/interview/list/",
      params: query,
    });
  }

  public async findFullInterviews(
    query: IInterview.FindInterviewsApiQuery
  ): Promise<IInterview.FindFullInterviewsApiResponse> {
    return this.get({
      route: "/api/v1/interview/full-list/",
      params: query,
    });
  }

  public async findInterviewById(id: number): Promise<IInterview.Self> {
    return this.get({ route: `/api/v1/interview/${id}` });
  }
}

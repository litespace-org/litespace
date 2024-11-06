import { Base } from "@/base";
import { IFilter, IInterview } from "@litespace/types";

export class Interview extends Base {
  public async create(
    payload: IInterview.CreateApiPayload
  ): Promise<IInterview.Self> {
    return await this.post(`/api/v1/interview`, payload);
  }

  public async update(
    id: number,
    payload: IInterview.UpdatePayload
  ): Promise<IInterview.Self> {
    return await this.put(`/api/v1/interview/${id}`, payload);
  }

  public async findInterviews({
    user,
    ...pagination
  }: {
    user?: number;
  } & IFilter.Pagination): Promise<IInterview.FindInterviewsApiResponse> {
    const url = user
      ? `/api/v1/interview/list/?user=${user}`
      : `/api/v1/interview/list/`;
    return this.get(url, null, pagination);
  }

  public async findInterviewById(id: number): Promise<IInterview.Self> {
    return this.get(`/api/v1/interview/${id}`);
  }
}

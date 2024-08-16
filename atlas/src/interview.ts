import { Base } from "@/base";
import { IInterview } from "@litespace/types";

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

  public async findInterviews(userId: number): Promise<IInterview.Self[]> {
    return this.get(`/api/v1/interview/list/${userId}`);
  }

  public async findInterviewById(id: number): Promise<IInterview.Self> {
    return this.get(`/api/v1/interview/${id}`);
  }
}

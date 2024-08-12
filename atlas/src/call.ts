import { Base } from "@/base";
import { ICall } from "@litespace/types";

export class Call extends Base {
  async create(payload: ICall.CreateApiPayload): Promise<ICall.Self> {
    return await this.client
      .post<ICall.Self>("/api/v1/call", JSON.stringify(payload))
      .then((response) => response.data);
  }

  async delete(id: number) {
    await this.client.delete(`/api/v1/call/${id}`);
  }

  async findMyCalls(): Promise<ICall.Self[]> {
    return await this.client
      .get<ICall.Self[]>("/api/v1/call/list")
      .then((response) => response.data);
  }

  async findHostCalls(id: number): Promise<ICall.HostCall[]> {
    return await this.client
      .get<ICall.HostCall[]>(`/api/v1/call/host/${id}/list`)
      .then((response) => response.data);
  }

  async findHostCallById(id: number): Promise<ICall.HostCall> {
    return await this.client
      .get<ICall.HostCall>(`/api/v1/call/host/${id}`)
      .then((response) => response.data);
  }

  async findTutorInterviews(id: number): Promise<ICall.AttendeeCall[]> {
    return this.client
      .get<ICall.AttendeeCall[]>(`/api/v1/call/tutor/interviews/${id}`)
      .then((response) => response.data);
  }

  async findById(id: number): Promise<ICall.Self> {
    return await this.client
      .get<ICall.Self>(`/api/v1/call/${id}`)
      .then((response) => response.data);
  }
}

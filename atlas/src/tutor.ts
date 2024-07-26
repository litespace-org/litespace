import { Base } from "@/base";
import { ITutor, RegisterTutorResponse } from "@litespace/types";

export class Tutor extends Base {
  async create(
    payload: ITutor.CreateApiPayload
  ): Promise<RegisterTutorResponse> {
    const { data } = await this.client.post<RegisterTutorResponse>(
      "/api/v1/tutor",
      JSON.stringify(payload)
    );

    return data;
  }

  async update(id: number, payload: ITutor.UpdateApiPayload): Promise<void> {
    await this.client.put(`/api/v1/tutor/${id}`, JSON.stringify(payload));
  }

  async delete(id: number) {
    await this.client.delete(`/api/v1/tutor/${id}`);
  }

  async findById(id: number): Promise<ITutor.FullTutor> {
    return await this.client
      .get<ITutor.FullTutor>(`/api/v1/tutor/${id}`)
      .then((response) => response.data);
  }

  async findAll(): Promise<ITutor.FullTutor[]> {
    return await this.client
      .get<ITutor.FullTutor[]>("/api/v1/tutor/list")
      .then((response) => response.data);
  }

  async findTutorsMedia(): Promise<ITutor.TutorMedia[]> {
    return await this.client
      .get<ITutor.TutorMedia[]>("/api/v1/tutor/media/list")
      .then((response) => response.data);
  }

  async findTutorMedaiById(id: number): Promise<ITutor.TutorMedia> {
    return await this.client
      .get<ITutor.TutorMedia>(`/api/v1/tutor/media/${id}`)
      .then((response) => response.data);
  }
}

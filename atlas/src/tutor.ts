import { Base } from "@/base";
import {
  ITutor,
  IUser,
  Paginated,
  RegisterTutorResponse,
} from "@litespace/types";

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

  async findTutorsMedia(): Promise<Paginated<ITutor.TutorMedia>> {
    return this.get("/api/v1/tutor/media/list");
  }

  async findTutorMedaiById(id: number): Promise<ITutor.TutorMedia> {
    return this.get(`/api/v1/tutor/media/${id}`);
  }

  async updateMedai(
    id: number,
    { photo, video }: { photo?: File; video?: File }
  ): Promise<void> {
    if (!photo && !video)
      throw new Error("At least one media must be provided");

    const formData = new FormData();

    if (photo) formData.append(IUser.UpdateMediaFilesApiKeys.Photo, photo);
    if (video) formData.append("video", video);

    await this.client.put(`/api/v1/tutor/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

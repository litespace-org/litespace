import { Base } from "@/base";
import {
  FindMeResponse,
  ITutor,
  IUser,
  Paginated,
  PagniationParams,
} from "@litespace/types";

export class User extends Base {
  async create(payload: IUser.CreateApiPayload): Promise<IUser.Self> {
    const { data } = await this.client.post<IUser.Self>(
      "/api/v1/user/",
      JSON.stringify(payload)
    );
    return data;
  }

  async findById(id: number | string): Promise<IUser.Self> {
    const { data } = await this.client.get<IUser.Self>(`/api/v1/user/${id}`);
    return data;
  }

  async findMe(): Promise<FindMeResponse> {
    return await this.client
      .get<FindMeResponse>("/api/v1/user/me")
      .then((response) => response.data);
  }

  async find(): Promise<Paginated<IUser.Self>> {
    return this.get(`/api/v1/user/list`);
  }

  async update(
    id: number,
    payload: IUser.UpdateApiPayload
  ): Promise<IUser.Self> {
    return this.put(`/api/v1/user/${id}`, payload);
  }

  async updateMedia(
    id: number,
    { photo, video }: { photo?: File; video?: File }
  ): Promise<IUser.Self> {
    if (!photo && !video)
      throw new Error("At least one media must be provided");

    const formData = new FormData();
    if (photo) formData.append(IUser.UpdateMediaFilesApiKeys.Photo, photo);
    if (video) formData.append(IUser.UpdateMediaFilesApiKeys.Video, video);

    const { data } = await this.client.put<IUser.Self>(
      `/api/v1/user/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  }

  async selectInterviewer(): Promise<IUser.Self> {
    return await this.client
      .get<IUser.Self>(`/api/v1/user/interviewer/select`)
      .then((response) => response.data);
  }

  async findTutorMeta(tutorId: number): Promise<ITutor.Self> {
    return await this.get(`/api/v1/user/tutor/meta/${tutorId}`);
  }

  async findAvailableTutors(params?: PagniationParams) {
    return await this.get(`/api/v1/tutor/list/available`, null, params);
  }
}

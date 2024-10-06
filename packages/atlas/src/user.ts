import { Base } from "@/base";
import {
  FindMeResponse,
  IFilter,
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
    payload: IUser.UpdateMediaPayload
  ): Promise<IUser.Self> {
    const formData = new FormData();
    if ("image" in payload)
      formData.append(IUser.UpdateMediaFilesApiKeys.Image, payload.image);
    if ("video" in payload)
      formData.append(IUser.UpdateMediaFilesApiKeys.Video, payload.video);

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    } as const;

    const { data } = await this.client.put<IUser.Self>(
      `/api/v1/user/${id}`,
      formData,
      config
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

  async findAvailableTutors(
    params?: PagniationParams
  ): Promise<ITutor.FindAvailableTutorsApiResponse> {
    return await this.get(`/api/v1/user/tutor/list/available`, null, params);
  }

  async findTutorsForMediaProvider(
    pagination?: IFilter.Pagination
  ): Promise<ITutor.FindTutorsForMediaProviderApiResponse> {
    return this.get(`/api/v1/user/media-provider/tutors`, null, pagination);
  }

  async findTutorStats(
    tutor: number
  ): Promise<ITutor.FindTutorStatsApiResponse> {
    return await this.get(`/api/v1/user/tutor/stats/${tutor}`);
  }

  async findTutorActivityScores(
    tutor: number
  ): Promise<ITutor.FindTutorActivityScores> {
    return await this.get(`/api/v1/user/tutor/activity/${tutor}`);
  }
}

import { Base } from "@/base";
import { IFilter, ITutor, IUser, PagniationParams } from "@litespace/types";

export class User extends Base {
  async create(
    payload: IUser.CreateApiPayload
  ): Promise<IUser.RegisterApiResponse> {
    return this.post("/api/v1/user/", payload);
  }

  async findById(id: number | string): Promise<IUser.Self> {
    const { data } = await this.client.get<IUser.Self>(`/api/v1/user/${id}`);
    return data;
  }

  async findTutorById(id: number): Promise<ITutor.FullTutor> {
    throw new Error("Not impelmented yet");
  }

  async findCurrentUser(): Promise<IUser.FindCurrentUserApiResponse> {
    return await this.get("/api/v1/user/current");
  }

  async find(
    query: IUser.FindUsersApiQuery
  ): Promise<IUser.FindUsersApiResponse> {
    return this.get(`/api/v1/user/list`, null, query);
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

  async findOnboardedTutors(
    params?: PagniationParams
  ): Promise<ITutor.FindOnboardedTutorsApiResponse> {
    return await this.get(`/api/v1/user/tutor/list/onboarded`, null, params);
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

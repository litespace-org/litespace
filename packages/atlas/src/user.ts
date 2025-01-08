import { Base } from "@/base";
import { IFilter, ITutor, IUser } from "@litespace/types";

export class User extends Base {
  async create(
    payload: IUser.CreateApiPayload
  ): Promise<IUser.RegisterApiResponse> {
    return this.post({ route: "/api/v1/user/", payload });
  }

  async findById(id: number | string): Promise<IUser.Self> {
    const { data } = await this.client.get<IUser.Self>(`/api/v1/user/${id}`);
    return data;
  }

  async findCurrentUser(): Promise<IUser.FindCurrentUserApiResponse> {
    return await this.get({ route: "/api/v1/user/current" });
  }

  async find(
    query: IUser.FindUsersApiQuery
  ): Promise<IUser.FindUsersApiResponse> {
    return this.get({ route: `/api/v1/user/list`, params: query });
  }

  async update(
    id: number,
    payload: IUser.UpdateApiPayload
  ): Promise<IUser.Self> {
    return this.put({ route: `/api/v1/user/${id}`, payload });
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
    return await this.get({ route: `/api/v1/user/tutor/meta/${tutorId}` });
  }

  async findTutorInfo(id: number): Promise<ITutor.FindTutorInfoApiResponse> {
    return await this.get({ route: `/api/v1/user/tutor/info/${id}` });
  }

  async findOnboardedTutors(
    params?: ITutor.FindOnboardedTutorsParams
  ): Promise<ITutor.FindOnboardedTutorsApiResponse> {
    return await this.get({
      route: `/api/v1/user/tutor/list/onboarded`,
      params,
    });
  }

  async findTutorsForStudio(
    pagination?: IFilter.Pagination
  ): Promise<ITutor.FindTutorsForStudioApiResponse> {
    return this.get({
      route: `/api/v1/user/studio/tutors`,
      params: pagination,
    });
  }

  async findTutorStats(
    tutor: number
  ): Promise<ITutor.FindTutorStatsApiResponse> {
    return await this.get({ route: `/api/v1/user/tutor/stats/${tutor}` });
  }

  async findPersonalizedTutorStats(): Promise<ITutor.FindPersonalizedTutorStatsApiResponse> {
    return await this.get({ route: `/api/v1/user/tutor/stats/personalized` });
  }

  async findStudentStats(
    student: number
  ): Promise<IUser.FindStudentStatsApiResponse> {
    return await this.get({ route: `/api/v1/user/student/stats/${student}` });
  }

  async findPersonalizedStudentStats(): Promise<IUser.FindPersonalizedStudentStatsApiResponse> {
    return await this.get({ route: `/api/v1/user/student/stats/personalized` });
  }

  async findTutorActivityScores(
    tutor: number
  ): Promise<ITutor.FindTutorActivityScores> {
    return await this.get({ route: `/api/v1/user/tutor/activity/${tutor}` });
  }

  async findUncontactedTutors(
    pagination?: IFilter.Pagination
  ): Promise<ITutor.FindUncontactedTutorsApiResponse> {
    return await this.get({
      route: `/api/v1/user/tutor/list/uncontacted`,
      params: pagination,
    });
  }
}

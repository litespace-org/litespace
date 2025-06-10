import { Base } from "@/lib/base";
import { IFilter, ITutor, IUser } from "@litespace/types";
import { AxiosProgressEvent } from "axios";

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

  async uploadUserImage({
    forUser,
    image,
    onUploadProgress,
  }: {
    /**
     * Required only when updating the image for another user (e.g., an admin is
     * upading an image for a studio).
     *
     * @note It can only be used with admins.
     *
     */
    forUser?: number;
    image: File;
    onUploadProgress?: (event: AxiosProgressEvent) => void;
  }): Promise<void> {
    const formData = new FormData();
    formData.append(IUser.AssetFileName.Image, image);

    const { data } = await this.client.put<void>(
      `/api/v1/user/asset`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        params: { forUser },
        onUploadProgress,
      }
    );
    return data;
  }

  async uploadTutorAssets({
    tutorId,
    image,
    video,
    thumbnail,
    onUploadProgress,
    abortSignal,
  }: {
    tutorId: number;
    image?: File;
    video?: File;
    thumbnail?: File;
    onUploadProgress?: (event: AxiosProgressEvent) => void;
    abortSignal?: AbortSignal;
  }): Promise<void> {
    const formData = new FormData();
    if (image) formData.append(IUser.AssetFileName.Image, image);
    if (video) formData.append(IUser.AssetFileName.Video, video);
    if (thumbnail) formData.append(IUser.AssetFileName.Thumbnail, thumbnail);

    const params: IUser.UploadTutorAssetsQuery = { tutorId };

    await this.client.put<void>(`/api/v1/user/asset/tutor`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params,
      onUploadProgress,
      signal: abortSignal,
    });
  }

  async selectInterviewer(): Promise<IUser.Self> {
    return await this.client
      .get<IUser.Self>(`/api/v1/user/interviewer/select`)
      .then((response) => response.data);
  }

  async findTutorMeta(
    query: ITutor.FindTutorMetaApiQuery
  ): Promise<ITutor.FindTutorMetaApiResponse> {
    return await this.get({ route: `/api/v1/user/tutor/meta`, params: query });
  }

  async findTutorInfo(id: number): Promise<ITutor.FindTutorInfoApiResponse> {
    return await this.get({ route: `/api/v1/user/tutor/info/${id}` });
  }

  async findOnboardedTutors(
    params?: ITutor.FindOnboardedTutorsQuery
  ): Promise<ITutor.FindOnboardedTutorsApiResponse> {
    return await this.get({
      route: `/api/v1/user/tutor/list/onboarded`,
      params,
    });
  }

  async findStudioTutor({
    tutorId,
  }: ITutor.FindStudioTutorParams): Promise<ITutor.FindStudioTutorApiResponse> {
    return this.get({
      route: `/api/v1/user/tutor/${tutorId}/for/studio`,
    });
  }

  async findStudioTutors(
    query: ITutor.FindStudioTutorsQuery
  ): Promise<ITutor.FindStudioTutorsApiResponse> {
    return this.get({
      route: `/api/v1/user/tutor/all/for/studio`,
      params: query,
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
  ): Promise<ITutor.FindFullUncontactedTutorsApiResponse> {
    return await this.get({
      route: `/api/v1/user/tutor/list/uncontacted`,
      params: pagination,
    });
  }

  async findFullTutors(
    query: ITutor.FindFullTutorsApiQuery
  ): Promise<ITutor.FindFullTutorsApiResponse> {
    return await this.get({
      route: `/api/v1/user/tutor/full-tutors`,
      params: query,
    });
  }

  async findTutoringMinutes(
    query: ITutor.FindTutoringMinutesApiQuery
  ): Promise<ITutor.FindTutoringMinutesApiResponse> {
    return await this.get({
      route: `/api/v1/user/tutor/tutoring-minutes`,
      params: query,
    });
  }

  async findStudios(
    query?: IFilter.Pagination
  ): Promise<IUser.FindStudiosApiResponse> {
    return await this.get({
      route: `/api/v1/user/studio/list`,
      params: query,
    });
  }
}

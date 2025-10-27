import { Base } from "@/lib/base";
import { ILesson, ISession } from "@litespace/types";

export class Lesson extends Base {
  async create(
    payload: ILesson.CreateApiPayload
  ): Promise<ILesson.CreateLessonApiResponse> {
    return this.post({ route: "/api/v1/lesson/", payload });
  }

  async createWithCard(
    payload: ILesson.CreateWithCardApiPayload
  ): Promise<ILesson.CreateWithCardApiResponse> {
    return this.post({ route: `/api/v1/lesson/card`, payload });
  }

  async createWithEWallet(
    payload: ILesson.CreateWithEWalletApiPayload
  ): Promise<ILesson.CreateWithEWalletApiResponse> {
    return this.post({ route: `/api/v1/lesson/ewallet`, payload });
  }

  async createWithFawry(
    payload: ILesson.CreateWithFawryRefNumApiPayload
  ): Promise<ILesson.CreateWithFawryRefNumApiResponse> {
    return this.post({ route: `/api/v1/lesson/fawry`, payload });
  }

  async findLessons(
    query: ILesson.FindLessonsApiQuery
  ): Promise<ILesson.FindUserLessonsApiResponse> {
    return this.get({
      route: `/api/v1/lesson/list/`,
      params: query,
    });
  }

  async findRefundableLessons(
    payload: ILesson.FindRefundableLessonsApiPayload
  ): Promise<ILesson.FindRefundableLessonsApiResponse> {
    return this.get({
      route: `/api/v1/lesson/refundable/`,
      payload,
    });
  }

  async findLesson(id: number): Promise<ILesson.FindLessonByIdApiResponse> {
    return await this.get({ route: `/api/v1/lesson/${id}` });
  }

  async findBySessionId(
    id: ISession.Id
  ): Promise<ILesson.FindLessonBySessionIdApiResponse | null> {
    return await this.get({ route: `/api/v1/lesson/session/${id}` });
  }

  async update(
    payload: ILesson.UpdateApiPayload
  ): Promise<ILesson.UpdateLessonApiResponse> {
    return await this.patch({ route: `/api/v1/lesson`, payload });
  }

  async cancel(id: number): Promise<void> {
    return this.patch({ route: `/api/v1/lesson/cancel/${id}` });
  }

  async report(id: number): Promise<void> {
    return this.patch({ route: `/api/v1/lesson/report/${id}` });
  }

  /**
   * retreive stats of attended (free/paid) lessons.
   */
  async stats(
    query: ILesson.FindAttendedLessonsStatsApiResponse
  ): Promise<ILesson.FindAttendedLessonsStatsApiQuery> {
    return this.get({ route: `/api/v1/lesson/attended/stats`, params: query });
  }

  async checkout(
    payload: ILesson.CheckoutPayload
  ): Promise<ILesson.CheckoutResponse> {
    return this.post({ route: `/api/v1/lesson/checkout`, payload });
  }
}

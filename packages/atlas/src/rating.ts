import { Base } from "@/base";
import { IFilter, IRating } from "@litespace/types";

export class Rating extends Base {
  async findById(id: number): Promise<IRating.Populated> {
    return await this.get({ route: `/api/v1/rating/${id}` });
  }

  async create(payload: IRating.CreateApiPayload): Promise<void> {
    await this.client.post("/api/v1/rating/", JSON.stringify(payload));
  }

  async update(id: number, payload: IRating.UpdateApiPayload): Promise<void> {
    await this.client.put(`/api/v1/rating/${id}`, JSON.stringify(payload));
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/v1/rating/${id}`);
  }

  async findRaterRatings(
    id: number
  ): Promise<IRating.FindRaterRatingsApiResponse> {
    return this.client
      .get(`/api/v1/rating/list/rater/${id}`)
      .then((response) => response.data);
  }

  async findRateeRatings(
    id: number
  ): Promise<IRating.FindRateeRatingsApiResponse> {
    return this.client
      .get(`/api/v1/rating/list/ratee/${id}`)
      .then((response) => response.data);
  }

  async findTutorRatings(
    id: number,
    pagination?: IFilter.Pagination
  ): Promise<IRating.FindTutorRatingsApiResponse> {
    return await this.get({ route: `/api/v1/rating/list/tutor/${id}`, params: pagination });
  }
}

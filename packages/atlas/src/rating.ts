import { Base } from "@/base";
import { IRating } from "@litespace/types";
import { Pagination } from "@litespace/types/dist/esm/filter";

export class Rating extends Base {
  async create(payload: IRating.CreateApiPayload): Promise<void> {
    await this.client.post("/api/v1/rating/", JSON.stringify(payload));
  }

  async update(id: number, payload: IRating.UpdateApiPayload): Promise<void> {
    await this.client.put(`/api/v1/rating/${id}`, JSON.stringify(payload));
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/v1/rating/${id}`);
  }

  async findRaterRatings(id: number): Promise<IRating.Populated[]> {
    return this.client
      .get<IRating.Populated[]>(`/api/v1/rating/list/rater/${id}`)
      .then((response) => response.data);
  }

  async findRateeRatings(id: number): Promise<IRating.Populated[]> {
    return this.client
      .get<IRating.Populated[]>(`/api/v1/rating/list/ratee/${id}`)
      .then((response) => response.data);
  }

  async findTutorRatings(
    id: number, 
    pagination?: Pagination
  ): Promise<IRating.FindTutorRatingsApiResponse> {
    return await this.get(`/api/v1/rating/list/tutor/${id}`, {}, pagination || {});
  }
}

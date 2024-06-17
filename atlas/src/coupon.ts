import { Base } from "@/base";
import { ICoupon } from "@litespace/types";

export class Coupon extends Base {
  async create(payload: ICoupon.CreateApiPayload): Promise<ICoupon.Self> {
    return this.client
      .post<ICoupon.Self>(`/api/v1/coupon`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async update(
    id: number,
    payload: ICoupon.UpdateApiPayload
  ): Promise<ICoupon.Self> {
    return this.client
      .put<ICoupon.Self>(`/api/v1/coupon/${id}`, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/v1/coupon/${id}`);
  }

  async findById(id: number): Promise<ICoupon.MappedAttributes> {
    return this.client
      .get<ICoupon.MappedAttributes>(`/api/v1/coupon/${id}`)
      .then((response) => response.data);
  }

  async findByCode(code: string): Promise<ICoupon.MappedAttributes> {
    return this.client
      .get<ICoupon.MappedAttributes>(`/api/v1/coupon/code/${code}`)
      .then((response) => response.data);
  }

  async findAll(): Promise<ICoupon.MappedAttributes[]> {
    return this.client
      .get<ICoupon.MappedAttributes[]>(`/api/v1/coupon/list`)
      .then((response) => response.data);
  }
}

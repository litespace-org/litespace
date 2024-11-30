import { Base } from "@/base";
import { ICoupon } from "@litespace/types";

export class Coupon extends Base {
  async create(payload: ICoupon.CreateApiPayload): Promise<ICoupon.Self> {
    return this.post(`/api/v1/coupon`, payload);
  }

  async update(
    id: number,
    payload: ICoupon.UpdateApiPayload
  ): Promise<ICoupon.Self> {
    return this.put(`/api/v1/coupon/${id}`, payload);
  }

  async delete(id: number): Promise<void> {
    await this.del(`/api/v1/coupon/${id}`);
  }

  async findById(id: number): Promise<ICoupon.Self> {
    return this.get(`/api/v1/coupon/${id}`);
  }

  async findByCode(code: string): Promise<ICoupon.Self> {
    return this.get(`/api/v1/coupon/code/${code}`);
  }

  async find(): Promise<ICoupon.FindCouponsApiResponse> {
    return this.get(`/api/v1/coupon/list`);
  }
}

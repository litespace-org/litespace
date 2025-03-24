import { Base } from "@/lib/base";
import { ICoupon } from "@litespace/types";

export class Coupon extends Base {
  async create(payload: ICoupon.CreateApiPayload): Promise<ICoupon.Self> {
    return this.post({
      route: `/api/v1/coupon`,
      payload,
    });
  }

  async update(
    id: number,
    payload: ICoupon.UpdateApiPayload
  ): Promise<ICoupon.Self> {
    return this.put({
      route: `/api/v1/coupon/${id}`,
      payload,
    });
  }

  async delete(id: number): Promise<void> {
    await this.del({ route: `/api/v1/coupon/${id} ` });
  }

  async findById(id: number): Promise<ICoupon.Self> {
    return this.get({ route: `/api/v1/coupon/${id}` });
  }

  async findByCode(code: string): Promise<ICoupon.Self> {
    return this.get({ route: `/api/v1/coupon/code/${code}` });
  }

  async find(): Promise<ICoupon.FindCouponsApiResponse> {
    return this.get({ route: `/api/v1/coupon/list` });
  }
}

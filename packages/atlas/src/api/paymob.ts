import { Base } from "@/lib/base";
import { IPaymob } from "@litespace/types";

export class Paymob extends Base {
  public async createCheckoutUrl(
    payload: IPaymob.CreateCheckoutUrlApiPayload
  ): Promise<IPaymob.CreateCheckoutUrlApiResponse> {
    return await this.post({
      route: "/api/v1/paymob/create-checkout-url",
      payload,
    });
  }
}

import { Base } from "@/lib/base";
import { IPaymob } from "@litespace/types";
import { AxiosInstance } from "axios";

export class Paymob extends Base {
  constructor(
    client: AxiosInstance,
    public readonly notificationUrl?: string,
    public readonly redirectionUrl?: string
  ) {
    super(client);
  }

  public async createClientSecret(
    payload: IPaymob.PaymentInfo
  ): Promise<string> {
    const { client_secret } = await this.post<
      object,
      IPaymob.IntentionApiResponse
    >({
      route: "/v1/intention/",
      payload: {
        amount: payload.items
          .map((i) => i.amount)
          .reduce((prev, cur) => prev + cur),
        currency: "EGP",
        payment_methods: payload.paymentMethods,
        items: payload.items,
        billing_data: {
          first_name: payload.billingData.firstName,
          last_name: payload.billingData.lastName,
          phone_number: payload.billingData.phoneNumber,
          email: payload.billingData.email,
        },
        special_reference: payload.specialReference,
        expiration: 3600,
        notification_url: this.notificationUrl,
        redirection_url: this.redirectionUrl,
      },
    });
    return client_secret;
  }
}

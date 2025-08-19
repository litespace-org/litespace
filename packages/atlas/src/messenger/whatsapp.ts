import { Base } from "@/lib/base";
import { IMessenger } from "@litespace/types";
import { AxiosInstance } from "axios";

export class Whatsapp extends Base {
  constructor(
    client: AxiosInstance,
    public readonly profileId: number
  ) {
    super(client);
  }

  sendSimpleMessage(payload: IMessenger.Message) {
    const keys = Object.keys(payload.template.parameters);
    const values = Object.values(payload.template.parameters);
    if (keys.length !== values.length) throw Error("should never happen!");

    return this.post({
      // as shown here: https://developers.facebook.com/docs/whatsapp/cloud-api/overview
      route: `/v23.0/${this.profileId}/messages`,
      payload: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: payload.to,
        type: "template",
        template: {
          name: payload.template.name,
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "body",
              parameters: keys.map((key, i) => ({
                type: "text",
                parameter_name: key,
                text: values[i].toString(),
              })),
            },
          ],
        },
      },
    });
  }

  sendOtpMessage(payload: IMessenger.OtpMessage) {
    return this.post({
      // as shown here: https://developers.facebook.com/docs/whatsapp/cloud-api/overview
      route: `/v23.0/${this.profileId}/messages`,
      payload: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: payload.to,
        type: "template",
        template: {
          name: payload.template.name,
          language: {
            code: "en_us",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: payload.template.parameters.otp,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: payload.template.parameters.otp,
                },
              ],
            },
          ],
        },
      },
    });
  }
}

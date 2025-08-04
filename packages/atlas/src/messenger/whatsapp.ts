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
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: Object.values(payload.template.parameters).map(
                (value) => ({
                  type: "text",
                  text: value.toString(),
                })
              ),
            },
          ],
        },
      },
    });
  }
}

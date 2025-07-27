import { Base } from "@/lib/base";
import { IMessenger } from "@litespace/types";

export class Whatsapp extends Base {
  sendSimpleMessage(payload: IMessenger.Message) {
    return this.post({
      // as shown here: https://developers.facebook.com/docs/whatsapp/cloud-api/overview
      route: "/messages",
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

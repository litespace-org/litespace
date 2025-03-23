import { Base } from "@/base";
import { IWhatsapp } from "@litespace/types";

export class Whatsapp extends Base {
  async send(payload: IWhatsapp.SendMessagePayload): Promise<void> {
    return this.post({
      route: `/api/v1/whatsapp/msg/`,
      payload,
    });
  }
}

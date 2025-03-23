import { Base } from "@/base";
import { ITelegram } from "@litespace/types";

export class Telegram extends Base {
  async send(payload: ITelegram.SendMessagePayload): Promise<void> {
    return this.post({
      route: `/api/v1/telegram/msg/`,
      payload,
    });
  }
}

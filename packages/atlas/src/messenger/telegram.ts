import { Base } from "@/lib/base";
import { ITelegram } from "@litespace/types";

export class Telegram extends Base {
  async resolvePhone(
    payload: ITelegram.ResolvePhonePayload
  ): Promise<ITelegram.ResolvePhoneResponse> {
    return this.post({
      route: `/api/v1/telegram/resolve-phone/`,
      payload,
    });
  }
}

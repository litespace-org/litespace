import { Base } from "@/lib/base";
import { IConfirmationCode } from "@litespace/types";

export class ConfirmationCode extends Base {
  async sendCode(payload: IConfirmationCode.SendCodePayload): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/send-verification-code`,
      payload,
    });
  }

  async verifyCode(
    payload: IConfirmationCode.VerifyCodePayload
  ): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/verify`,
      payload,
    });
  }
}

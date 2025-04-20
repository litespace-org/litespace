import { Base } from "@/lib/base";
import { IConfirmationCode } from "@litespace/types";

export class ConfirmationCode extends Base {
  async sendVerifyNotificationMethodCode(
    payload: IConfirmationCode.SendVerifyNotificationMethodCodePayload
  ): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/notification/send`,
      payload,
    });
  }

  async verifyNotificationMethodCode(
    payload: IConfirmationCode.VerifyNotificationMethodCodePayload
  ): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/notification/verify`,
      payload,
    });
  }
}

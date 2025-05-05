import { Base } from "@/lib/base";
import { IConfirmationCode } from "@litespace/types";
import { SendEmailConfirmationCodeResponse } from "@litespace/types/dist/esm/confirmationCode";

export class ConfirmationCode extends Base {
  async sendVerifyPhoneCode(
    payload: IConfirmationCode.SendVerifyPhoneCodePayload
  ): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/phone/send`,
      payload,
    });
  }

  async verifyPhoneCode(
    payload: IConfirmationCode.VerifyPhoneCodePayload
  ): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/phone/verify`,
      payload,
    });
  }

  async sendEmailConfirmationCode(
    payload: IConfirmationCode.SendEmailConfirmationCodePayload
  ): Promise<SendEmailConfirmationCodeResponse> {
    return await this.post({
      route: `/api/v1/confirmation-code/email/send`,
      payload,
    });
  }

  async confirmEmailWithCode(
    payload: IConfirmationCode.ConfirmEmailByCodePayload
  ): Promise<IConfirmationCode.ConfirmEmailByCodeResponse> {
    return await this.post({
      route: `/api/v1/confirmation-code/email/confirm`,
      payload,
    });
  }
}

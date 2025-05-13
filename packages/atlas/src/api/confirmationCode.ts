import { Base } from "@/lib/base";
import { IConfirmationCode } from "@litespace/types";

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

  async confirmVerificationEmailCode(
    payload: IConfirmationCode.VerifyEmailPayload
  ): Promise<void> {
    await this.post({
      route: "/api/v1/confirmation-code/email/confirm",
      payload,
    });
  }

  async sendVerificationEmailCode(): Promise<void> {
    await this.post({
      route: "/api/v1/confirmation-code/email/send",
    });
  }

  async confirmForgetPasswordCode(
    payload: IConfirmationCode.ConfirmForgetPasswordCodePayload
  ): Promise<IConfirmationCode.ConfirmPasswordCodeApiResponse> {
    await this.post({
      route: "/api/v1/confirmation-code/password/confirm",
      payload,
    });
  }

  async sendForgetPasswordCode(
    payload: IConfirmationCode.SendForgetPasswordEmailPayload
  ): Promise<void> {
    await this.post({
      route: "/api/v1/confirmation-code/password/send",
      payload,
    });
  }
}

import { Base } from "@/lib/base";
import { IConfirmationCode } from "@litespace/types";

export class ConfirmationCode extends Base {
  async sendVerifyPhoneCode(
    payload: IConfirmationCode.SendVerifyPhoneCodeApiPayload
  ): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/phone/send`,
      payload,
    });
  }

  async verifyPhoneCode(
    payload: IConfirmationCode.VerifyPhoneCodeApiPayload
  ): Promise<void> {
    return await this.post({
      route: `/api/v1/confirmation-code/phone/verify`,
      payload,
    });
  }

  async confirmVerificationEmailCode(
    payload: IConfirmationCode.VerifyEmailApiPayload
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
    payload: IConfirmationCode.ConfirmForgetPasswordCodeApiPayload
  ): Promise<IConfirmationCode.ConfirmPasswordCodeApiResponse> {
    await this.post({
      route: "/api/v1/confirmation-code/password/confirm",
      payload,
    });
  }

  async sendForgetPasswordCode(
    payload: IConfirmationCode.SendForgetPasswordEmailApiPayload
  ): Promise<void> {
    await this.post({
      route: "/api/v1/confirmation-code/password/send",
      payload,
    });
  }
}

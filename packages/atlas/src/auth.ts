import { Base } from "@/base";
import { IUser } from "@litespace/types";

export class Auth extends Base {
  async password(
    credentials: IUser.Credentials
  ): Promise<IUser.LoginApiResponse> {
    return this.post({
      route: "/api/v1/auth/password",
      payload: credentials,
    });
  }

  async google(
    payload: IUser.GoogleAuthPayload
  ): Promise<IUser.LoginApiResponse> {
    return this.post({
      route: "/api/v1/auth/google",
      payload,
    });
  }

  async forgetPassword(payload: IUser.ForgetPasswordApiPayload): Promise<void> {
    await this.post({
      route: "/api/v1/auth/password/forget",
      payload,
    });
  }

  async resetPassword(
    payload: IUser.ResetPasswordApiPayload
  ): Promise<IUser.ResetPasswordApiResponse> {
    return await this.put({
      route: "/api/v1/auth/password/reset",
      payload,
    });
  }

  async token(token: string) {
    await this.post({
      route: "/api/v1/auth/token",
      payload: { token },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.put({
      route: "/api/v1/auth/verify-email",
      payload: { token },
    });
  }

  async sendVerifyEmail(callbackUrl: string): Promise<void> {
    await this.put({
      route: "/api/v1/auth/send-verify-email",
      payload: { callbackUrl },
    });
  }
}

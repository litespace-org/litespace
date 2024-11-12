import { Base } from "@/base";
import { IUser } from "@litespace/types";

export class Auth extends Base {
  async password(
    credentials: IUser.Credentials
  ): Promise<IUser.LoginApiResponse> {
    return this.post("/api/v1/auth/password", credentials);
  }

  async google(
    token: string,
    role?: typeof IUser.Role.Student | typeof IUser.Role.Tutor
  ): Promise<IUser.LoginApiResponse> {
    return this.post("/api/v1/auth/google", { token, role });
  }

  async forgotPassword(
    payload: IUser.ForegetPasswordApiPayload
  ): Promise<void> {
    await this.post("/api/v1/auth/password/forgot", payload);
  }

  async resetPassword(
    payload: IUser.ResetPasswordApiPayload
  ): Promise<IUser.ResetPasswordApiResponse> {
    return await this.put("/api/v1/auth/password/reset", payload);
  }

  async token(token: string) {
    await this.post("/api/v1/auth/token", { token });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.put("/api/v1/auth/verify-email", { token });
  }

  async sendVerifyEmail(callbackUrl: string): Promise<void> {
    await this.put("/api/v1/auth/send-verify-email", { callbackUrl });
  }
}

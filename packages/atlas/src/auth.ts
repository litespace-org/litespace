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

  async forgotPassword(email: string): Promise<void> {
    await this.client.post(
      "/api/v1/auth/password/forgot",
      JSON.stringify({ email })
    );
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }): Promise<void> {
    await this.client.put(
      "/api/v1/auth/password/reset",
      JSON.stringify({ token, password })
    );
  }

  async token(token: string) {
    await this.client.post("/api/v1/auth/token", null, {
      params: { token },
    });
  }

  async logout(): Promise<void> {
    return this.post("/api/v1/auth/logout");
  }
}

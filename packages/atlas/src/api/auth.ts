import { Base } from "@/lib/base";
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

  async refreshToken(): Promise<IUser.RefreshAuthTokenApiResponse> {
    return this.post({ route: "/api/v1/auth/refresh-token" });
  }
}

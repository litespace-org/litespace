import { Base } from "@/base";
import { asFullUrl } from "@/utils";
import { Backend, IUser } from "@litespace/types";
import { backendApiUrls } from "@/client";

type AuthorizationUrls = {
  google: string;
  facebook: string;
  discord: string;
};

export class Auth extends Base {
  public readonly authorization: AuthorizationUrls;

  constructor(backend: Backend) {
    super(backend);

    const api = backendApiUrls[backend];
    this.authorization = {
      google: asFullUrl(api, "/api/v1/auth/google"),
      facebook: asFullUrl(api, "/api/v1/auth/facebook"),
      discord: asFullUrl(api, "/api/v1/auth/discord"),
    };
  }

  async password(credentials: IUser.Credentials) {
    await this.client.post(
      "/api/v1/auth/password",
      JSON.stringify(credentials)
    );
  }

  async token(token: string) {
    await this.client.post("/api/v1/auth/token", null, {
      params: { token },
    });
  }

  async logout() {
    await this.client.post("/api/v1/auth/logout");
  }
}

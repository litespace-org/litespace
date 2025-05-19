import { Api as AtlasApi, AuthToken, TokenType } from "@litespace/atlas";
import { IUser } from "@litespace/types";
import { faker } from "@faker-js/faker/locale/ar";
import { sample } from "lodash";
import db from "@fixtures/db";
import { tutors } from "@litespace/models";

function asBearerToken(token?: string): AuthToken | null {
  if (!token) return null;
  return {
    type: TokenType.Bearer,
    value: token,
  };
}

export function api(token?: string): AtlasApi {
  return new AtlasApi("local", asBearerToken(token));
}

export function unexpectedApiSuccess() {
  throw new Error("Unexpected API response; Request should fail");
}

export class Api {
  token: string;
  public readonly api: AtlasApi;

  constructor(token?: string) {
    this.api = api(token);
    this.token = token || "";
  }

  static async fromCredentials(email: string, password: string) {
    const result = await api().auth.password({ email, password });
    return new Api(result.token);
  }

  static async forUser(role: IUser.Role) {
    const email = faker.internet.email();
    const password = "Password@8";
    await db.user({ role, email, password });
    return await Api.fromCredentials(email, password);
  }

  static async forSuperAdmin() {
    return await this.forUser(IUser.Role.SuperAdmin);
  }

  static async forStudent() {
    return await this.forUser(IUser.Role.Student);
  }

  static async forTutor() {
    const res = await this.forUser(IUser.Role.Tutor);

    // insert row in tutors table
    const current = await res.findCurrentUser();
    await tutors.create(current.id);

    return res;
  }

  async createUser(payload?: Partial<IUser.CreateApiPayload>) {
    return this.api.user.create({
      email: payload?.email || faker.internet.email(),
      password: payload?.password || "Password@8",
      role: payload?.role || (sample(Object.values(IUser.Role)) as IUser.Role),
    });
  }

  async findCurrentUser() {
    return this.api.user.findCurrentUser();
  }
}

export default {
  api,
};

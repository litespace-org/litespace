import { Atlas, TokenType } from "@litespace/atlas";
import { users } from "@litespace/models";
import { Backend, IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { faker } from "@faker-js/faker/locale/ar";
import { pad, sample } from "lodash";
import db from "@fixtures/db";

export function atlas(token?: string): Atlas {
  return new Atlas(Backend.Local, () => {
    if (!token) return null;
    return {
      type: TokenType.Bearer,
      value: token,
    };
  });
}

export function unexpectedApiSuccess() {
  throw new Error("Unexpected API response; Request should fail");
}

export class Api {
  public readonly atlas: Atlas;
  constructor(token?: string) {
    this.atlas = atlas(token);
  }

  static async fromCredentials(email: string, password: string) {
    const result = await atlas().auth.password({ email, password });
    return new Api(result.token);
  }

  static async forUser(role: IUser.Role) {
    const email = faker.internet.email();
    const password = faker.internet.password();
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
    return await this.forUser(IUser.Role.Tutor);
  }

  async createUser(payload?: Partial<IUser.CreateApiPayload>) {
    return this.atlas.user.create({
      callbackUrl: payload?.callbackUrl || faker.internet.url(),
      email: payload?.email || faker.internet.email(),
      password: payload?.password || faker.internet.password(),
      role: payload?.role || sample(Object.values(IUser.Role))!,
    });
  }
}

export default {
  atlas,
};

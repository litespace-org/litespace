import { Atlas, TokenType } from "@litespace/atlas";
import { users } from "@litespace/models";
import { Backend, IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { faker } from "@faker-js/faker/locale/ar";
import { sample } from "lodash";

export function atlas(token?: string): Atlas {
  return new Atlas(Backend.Local, () => {
    if (!token) return null;
    return {
      type: TokenType.Bearer,
      value: token,
    };
  });
}

export default {
  atlas,
};

export async function createAdmin() {
  const email = "admin@litespace.org";
  const password = "password";
  await users.create({
    name: "Admin",
    email: email,
    password: hashPassword(password),
    role: IUser.Role.SuperAdmin,
    birthYear: 2001,
  });

  const response = await atlas().auth.password({
    email,
    password,
  });

  return response;
}

export function gender(): IUser.Gender {
  return sample([IUser.Gender.Male, IUser.Gender.Female])!;
}

export async function createUser(
  payload: Omit<Partial<IUser.Self>, "password"> & {
    password?: string;
  }
) {
  const password = payload.password || faker.internet.password();

  const user = await users.create({
    email: payload.email || faker.internet.email(),
    gender: payload.gender || gender(),
    name: payload.name || faker.internet.username(),
    password: hashPassword(password),
    birthYear: payload.birthYear || faker.number.int({ min: 2000, max: 2024 }),
    role: payload.role || IUser.Role.Tutor,
  });

  const response = await atlas().auth.password({
    email: user.email,
    password,
  });

  return response;
}

import { client } from "@/api/axios";
import { PossibleError, safe } from "@/lib/error";
import { User } from "@/types";

async function register({
  name,
  email,
  password,
  type,
}: {
  name: string;
  email: string;
  password: string;
  type: User.Type.Student | User.Type.Tutor;
}): Promise<{ user: User.Self; token: string }> {
  const { data } = await client.post<{ user: User.Self; token: string }>(
    "/api/v1/user",
    JSON.stringify({
      name,
      type,
      email,
      password,
      avatar: null,
    })
  );

  return data;
}

async function findMe(): Promise<PossibleError<User.Self>> {
  return safe(async () => {
    const { data } = await client.get<User.Self>("/api/v1/user/me");
    return data;
  });
}

async function update(
  user: Partial<{
    email: string;
    password: string;
    name: string;
    avatar: string;
    birthday: string;
    gender: User.Gender;
    active: boolean;
    type: User.Type.Tutor | User.Type.Student;
  }>
) {
  await client.put("/api/v1/user/", JSON.stringify(user));
}

export default {
  register,
  findMe,
  update,
};

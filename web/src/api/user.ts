import { client } from "@/api/axios";
import { PossibleError, safe } from "@/lib/error";
import { User } from "@/types";

async function register({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<number> {
  const { data } = await client.post<{ id: number }>(
    "/api/v1/student",
    JSON.stringify({
      name,
      email,
      password,
      avatar: null,
    })
  );

  return data.id;
}

async function findMe(): Promise<PossibleError<User.Self>> {
  return safe(async () => {
    const { data } = await client.get<User.Self>("/api/v1/user/me");
    return data;
  });
}

export default {
  register,
  findMe,
};

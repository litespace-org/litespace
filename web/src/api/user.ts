import { client } from "@/api/axios";

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

export default {
  register,
};

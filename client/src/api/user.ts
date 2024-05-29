import { client } from "@/api/axios";

export async function register({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<number> {
  const { data } = await client.post<{ id: number }>("/api/v1/user", {
    name,
    email,
    password,
  });

  return data.id;
}

export default {
  register,
};

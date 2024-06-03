import { client } from "@/api/axios";

export async function findMe(): Promise<boolean | null> {
  try {
    const { data } = await client.get<boolean>("/api/v1/user/me");
    return true;
  } catch (error) {
    return null;
  }
}

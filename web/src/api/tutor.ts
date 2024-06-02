import { client } from "@/api/axios";

export type Tutor = {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  gender: string | null;
  active: boolean;
  bio: string | null;
  about: string | null;
  video: string | null;
  createdAt: string;
  updatedAt: string;
  metaUpdatedAt: string;
};

async function findAll(): Promise<Tutor[]> {
  const { data } = await client.get<Tutor[]>("/api/v1/tutor/list");
  return data;
}

export default {
  findAll,
};

import { Self, Type, Gender } from "@/user";

export type FindMeResponse = Self;

export type UpdateUserPayload = Partial<{
  email: string;
  password: string;
  name: string;
  avatar: string;
  birthday: string;
  gender: Gender;
  active: boolean;
  type: Type;
}> & { id: number };

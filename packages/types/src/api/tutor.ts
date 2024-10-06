import { Credentials } from "@/user";
import { Nullable } from "@/utils";

export type RegisterTutorPayload = Credentials & { name: string };

export type RegisterTutorResponse = { token: string };

export type TutorsList = Array<{
  id: number;
  email: string;
  name: Nullable<string>;
  photo: Nullable<string>;
  gender: Nullable<string>;
  active: boolean;
  bio: Nullable<string>;
  about: Nullable<string>;
  video: Nullable<string>;
  createdAt: string;
  updatedAt: string;
  metaUpdatedAt: string;
}>;

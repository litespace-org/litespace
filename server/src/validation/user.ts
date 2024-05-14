import { passwordRegex } from "@/constants";
import { User } from "@/database";
import zod from "zod";

export const create = zod.object({
  email: zod.string().trim().email(),
  password: zod.string().regex(passwordRegex),
  name: zod.string().trim().min(3),
  avatar: zod.union([zod.null(), zod.string().trim()]),
  type: zod.enum([User.Type.Teacher, User.Type.Student]),
});

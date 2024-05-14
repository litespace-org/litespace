import { passwordRegex } from "@/constants";
import { User } from "@/database";
import zod from "zod";

const id = zod.coerce.number().positive();
const password = zod.string().regex(passwordRegex);
const email = zod.string().trim().email();
const name = zod.string().trim().min(3);
const avatar = zod.union([zod.null(), zod.string().trim()]);

const user = {
  create: zod.object({
    email,
    password,
    name,
    avatar,
    type: zod.enum([User.Type.Teacher, User.Type.Student]),
  }),
  update: {
    body: zod.object({
      id,
      email: zod.optional(email),
      password: zod.optional(password),
      name: zod.optional(name),
      avatar: zod.optional(avatar),
    }),
  },
  delete: {
    params: zod.object({ id }),
  },
  get: {
    query: zod.object({ id: zod.optional(id) }),
  },
};

export default {
  user,
};

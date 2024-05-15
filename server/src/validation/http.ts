import { passwordRegex } from "@/constants";
import { User } from "@/database";
import zod from "zod";

const id = zod.coerce.number({ message: "Invalid user id" }).positive();

const password = zod
  .string({ message: "Invalid password" })
  .regex(passwordRegex, "Invalid password");

const email = zod
  .string({ message: "Invalid email" })
  .trim()
  .email("Invalid email");

const name = zod
  .string({ message: "invalid email" })
  .trim()
  .min(3, "Invalid name");

const avatar = zod.union([zod.null(), zod.string().trim()], {
  message: "Invalid avatar",
});

const user = {
  create: zod.object(
    {
      email,
      password,
      name,
      avatar,
      type: zod.enum([User.Type.Teacher, User.Type.Student], {
        message: "Invalid user type",
      }),
    },
    {
      message: "Empty request body",
    }
  ),
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
    query: zod.object({ id }),
  },
  get: {
    query: zod.object({ id: zod.optional(id) }),
  },
};

const auth = {
  header: zod.object({
    authorization: zod
      .string({ message: "Invalid authorization header" })
      .trim(),
  }),
};

export default {
  user,
  auth,
};

import { passwordRegex } from "@/constants";
import { User, Slot } from "@/database";
import zod from "zod";

const id = zod.coerce.number({ message: "Invalid id" }).positive();

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
      type: zod.enum([User.Type.Tutor, User.Type.Student], {
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
  delete: { query: zod.object({ id }) },
  get: { query: zod.object({ id }) },
  login: {
    body: zod.object({ email, password }),
  },
} as const;

const auth = {
  header: zod.object({
    authorization: zod
      .string({ message: "Invalid authorization header" })
      .startsWith("Bearer", "Invalid bearer token")
      .trim(),
  }),
} as const;

const weekday = zod.coerce.number().min(-1).max(6);
const time = zod.string().time();
const date = zod.coerce.string().date();
const repeat = zod.enum([
  Slot.Repeat.NoRepeat,
  Slot.Repeat.Daily,
  Slot.Repeat.EveryWeek,
  Slot.Repeat.EveryMonth,
]);

const slot = {
  create: zod.object({
    title: zod.string().trim(),
    description: zod.string().trim(),
    weekday: weekday,
    time: zod.object({ start: time, end: time }),
    date: zod.object({ start: date, end: date }),
    repeat,
  }),
  update: zod.object({
    id,
    title: zod.optional(zod.string().trim()),
    description: zod.optional(zod.string().trim()),
    weekday: zod.optional(weekday),
    time: zod.optional(
      zod.object({ start: zod.optional(time), end: zod.optional(time) })
    ),
    date: zod.optional(
      zod.object({ start: zod.optional(date), end: zod.optional(date) })
    ),
  }),
  get: {
    query: zod.object({ id }),
  },
  delete: {
    query: zod.object({ id }),
  },
} as const;

export default {
  user,
  auth,
  slot,
};

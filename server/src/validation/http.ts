import zod from "zod";
import {
  optionalString,
  rating,
  id,
  password,
  email,
  name,
  weekday,
  time,
  date,
  repeat,
  url,
  datetime,
  string,
  subscriptionPeriod,
  gender,
  userType,
} from "@/validation/utils";
import { IUser } from "@litespace/types";

const avatar = zod.union([zod.null(), zod.string().trim()], {
  message: "Invalid avatar",
});

const user = {
  create: zod.object(
    {
      email,
      password,
      name,
      type: zod.enum([
        IUser.Type.SuperAdmin,
        IUser.Type.RegularAdmin,
        IUser.Type.Examiner,
      ]),
    },
    { message: "Empty request body" }
  ),
  update: {
    body: zod.object({
      id,
      email: zod.optional(email),
      password: zod.optional(password),
      name: zod.optional(name),
      avatar: zod.optional(zod.string()),
      gender: zod.optional(gender),
      birthday: zod.optional(date),
      type: zod.optional(zod.enum([IUser.Type.Tutor, IUser.Type.Student])),
    }),
  },
  delete: { query: zod.object({ id }) },
  findById: { params: zod.object({ id }) },
  login: { body: zod.object({ email, password }) },
} as const;

const auth = {
  header: zod.object({
    authorization: zod
      .string({ message: "Invalid authorization header" })
      .startsWith("Bearer", "Invalid bearer token")
      .trim(),
  }),
  localAuthorization: zod.object({ email, password }),
} as const;

const slot = {
  create: zod.object({
    title: zod.string().trim(),
    description: zod.string().trim(),
    weekday: weekday,
    time: zod.object({ start: time, end: time }),
    date: zod.object({ start: date, end: zod.optional(date) }),
    repeat,
  }),
  update: zod.object({
    id,
    title: optionalString,
    description: optionalString,
    weekday: zod.optional(weekday),
    time: zod.optional(
      zod.object({ start: zod.optional(time), end: zod.optional(time) })
    ),
    date: zod.optional(
      zod.object({ start: zod.optional(date), end: zod.optional(date) })
    ),
  }),
  get: { query: zod.object({ id }) },
  delete: { query: zod.object({ id }) },
  getDiscreteTimeSlots: { query: zod.object({ tutorId: id }) },
} as const;

const student = {
  create: zod.object(
    { email, password, name },
    { message: "Empty request body" }
  ),
} as const;

const tutor = {
  create: { body: student.create },
  update: {
    body: zod.object({
      email: zod.optional(email),
      password: zod.optional(password),
      name: zod.optional(name),
      avatar: zod.optional(avatar),
      bio: optionalString,
      about: optionalString,
      video: zod.optional(url),
    }),
  },
  get: { query: zod.object({ id }) },
  delete: { query: zod.object({ id }) },
} as const;

const zoom = {
  setRefreshToken: {
    body: zod.object({ code: zod.string({ message: "Invalid zoom code" }) }),
  },
};

const lesson = {
  create: {
    body: zod.object({
      slotId: id,
      start: datetime,
      duration: zod.coerce.number().positive(),
    }),
  },
  get: { query: zod.object({ id }) },
  delete: { query: zod.object({ id }) },
};

const ratings = {
  create: {
    body: zod.object({
      tutorId: id,
      value: rating,
      note: zod.optional(string),
    }),
  },
  update: {
    body: zod.object({
      id,
      value: zod.optional(rating),
      note: zod.optional(string),
    }),
  },
  get: { query: zod.object({ tutorId: id }) },
  delete: { query: zod.object({ id }) },
} as const;

const subscription = {
  create: {
    body: zod.object({
      monthlyMinutes: zod.coerce.number().positive().int(),
      period: subscriptionPeriod,
      autoRenewal: zod.boolean(),
    }),
  },
  update: {
    body: zod.object({
      period: zod.optional(subscriptionPeriod),
      autoRenewal: zod.optional(zod.boolean()),
    }),
  },
} as const;

const chat = {
  create: {
    body: zod.object({ tutorId: id }),
  },
} as const;

export default {
  user,
  auth,
  slot,
  student,
  tutor,
  zoom,
  lesson,
  rating: ratings,
  subscription,
  chat,
};

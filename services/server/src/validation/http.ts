import zod from "zod";
import {
  optionalString,
  id,
  password,
  email,
  name,
  weekday,
  time,
  date,
  url,
  string,
  subscriptionPeriod,
  gender,
  identityObject,
  boolean,
  role,
  jsonBoolean,
} from "@/validation/utils";
import { IFilter, IUser } from "@litespace/types";

const user = {
  create: zod.object(
    {
      role,
      email,
      password,
    },
    { message: "Empty request body" }
  ),
  update: {
    body: zod.object({
      email: zod.optional(email),
      password: zod.optional(password),
      name: zod.optional(name),
      gender: zod.optional(gender),
      birthYear: zod.optional(zod.number().positive()),
      role: zod.optional(zod.enum([IUser.Role.Tutor, IUser.Role.Student])),
    }),
  },
  delete: { query: zod.object({ id }) },
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
    weekday,
    time: zod.object({ start: time, end: time }),
    date: zod.object({ start: date, end: zod.optional(date) }),
  }),
  update: {
    params: zod.object({ id }),
    body: zod.object({
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
  },
  get: { params: zod.object({ id }) },
  delete: { params: zod.object({ id }) },
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
      // birthday: zod.optional(date),
      gender: zod.optional(gender),
      bio: zod.optional(string),
      about: zod.optional(string),
      activated: zod.optional(zod.boolean()),
      activatedBy: zod.optional(id),
      passedInterview: zod.optional(zod.boolean()),
      interviewUrl: zod.optional(url),
      dropPhoto: zod.optional(boolean),
      dropVideo: zod.optional(boolean),
    }),
    params: identityObject,
  },
  get: { params: identityObject },
  delete: { params: identityObject },
} as const;

const call = {
  get: { params: identityObject },
};

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

const reportReply = {
  create: {
    body: zod.object({
      reportId: id,
      message: string.max(1000),
      draft: boolean,
    }),
  },
  update: {
    body: zod.object({
      message: zod.optional(string.max(1000)),
      draft: zod.optional(boolean),
    }),
  },
} as const;

const assets = {
  remove: {
    params: zod.object({ name: string }),
  },
} as const;

export type FilterFields = [string, ...string[]];

export function httpQueryFilter(
  fields: FilterFields,
  value: unknown
): IFilter.Self {
  return zod
    .object({
      page: zod.optional(zod.coerce.number().positive().min(1).int()),
      size: zod.optional(zod.coerce.number().positive().min(1).int()),
      order: zod.optional(zod.array(zod.enum(fields))),
      search: zod.optional(zod.string()),
      columns: zod.optional(zod.array(zod.enum(fields))),
      sensitive: zod.optional(jsonBoolean),
      match: zod.optional(
        zod.enum([
          IFilter.Match.Exact,
          IFilter.Match.Prefix,
          IFilter.Match.Suffix,
          IFilter.Match.Loose,
        ])
      ),
      direction: zod.optional(
        zod.array(
          zod.enum([
            IFilter.OrderDirection.Ascending,
            IFilter.OrderDirection.Descending,
          ])
        )
      ),
    })
    .parse(value);
}

export default {
  user,
  auth,
  slot,
  student,
  tutor,
  call,
  subscription,
  chat,
  reportReply,
  assets,
};

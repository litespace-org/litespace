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
  identityObject,
  callType,
  callSize,
  number,
  boolean,
} from "@/validation/utils";
import { IUser } from "@litespace/types";

const user = {
  create: zod.object(
    {
      email,
      password,
      name,
      type: zod.enum([
        IUser.Type.SuperAdmin,
        IUser.Type.RegularAdmin,
        IUser.Type.Tutor,
        IUser.Type.Student,
        IUser.Type.Interviewer,
        IUser.Type.MediaProvider,
      ]),
    },
    { message: "Empty request body" }
  ),
  update: {
    body: zod.object({
      email: zod.optional(email),
      password: zod.optional(password),
      name: zod.optional(name),
      gender: zod.optional(gender),
      birthYear: zod.optional(zod.number().min(1950)),
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
  forgotPassword: { body: zod.object({ email }) },
  resetPassword: { body: zod.object({ token: string, password }) },
  verifyEmail: { body: zod.object({ token: string }) },
} as const;

const slot = {
  create: zod.object({
    title: zod.string().trim(),
    weekday,
    time: zod.object({ start: time, end: time }),
    date: zod.object({ start: date, end: zod.optional(date) }),
    repeat,
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
      // birthday: zod.optional(date),
      gender: zod.optional(gender),
      bio: zod.optional(string),
      about: zod.optional(string),
      activated: zod.optional(zod.boolean()),
      activatedBy: zod.optional(id),
      passedInterview: zod.optional(zod.boolean()),
      interviewUrl: zod.optional(url),
    }),
    params: identityObject,
  },
  get: { params: identityObject },
  delete: { params: identityObject },
} as const;

const call = {
  create: {
    body: zod.object({
      slotId: id,
      start: datetime,
      type: callType,
      size: callSize,
    }),
  },
  get: { params: identityObject },
  delete: { params: identityObject },
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

const plan = {
  create: {
    body: zod.object({
      alias: string,
      weeklyMinutes: number,
      fullMonthPrice: number,
      fullQuarterPrice: number,
      halfYearPrice: number,
      fullYearPrice: number,
      fullMonthDiscount: number,
      fullQuarterDiscount: number,
      halfYearDiscount: number,
      fullYearDiscount: number,
      forInvitesOnly: boolean,
      active: boolean,
    }),
  },
  update: {
    params: identityObject,
    body: zod.object({
      weeklyMinutes: zod.optional(number),
      fullMonthPrice: zod.optional(number),
      fullQuarterPrice: zod.optional(number),
      halfYearPrice: zod.optional(number),
      fullYearPrice: zod.optional(number),
      fullMonthDiscount: zod.optional(number),
      fullQuarterDiscount: zod.optional(number),
      halfYearDiscount: zod.optional(number),
      fullYearDiscount: zod.optional(number),
      forInvitesOnly: zod.optional(boolean),
      active: zod.optional(boolean),
    }),
  },
} as const;

const coupon = {
  create: {
    body: zod.object({
      code: string,
      planId: number,
      fullMonthDiscount: number,
      fullQuarterDiscount: number,
      halfYearDiscount: number,
      fullYearDiscount: number,
      expiresAt: datetime,
    }),
  },
  update: {
    body: zod.object({
      code: zod.optional(string),
      planId: zod.optional(number),
      fullMonthDiscount: zod.optional(number),
      fullQuarterDiscount: zod.optional(number),
      halfYearDiscount: zod.optional(number),
      fullYearDiscount: zod.optional(number),
      expiresAt: zod.optional(datetime),
    }),
  },
  findByCode: {
    params: zod.object({ code: string }),
  },
} as const;

const invite = {
  create: {
    body: zod.object({
      email: email,
      planId: id,
      expiresAt: datetime,
    }),
  },
  update: {
    body: zod.object({
      email: zod.optional(email),
      planId: zod.optional(id),
      expiresAt: zod.optional(datetime),
    }),
  },
} as const;

const report = {
  create: {
    body: zod.object({
      title: string.max(255),
      description: string.max(1000),
      category: string.max(255),
    }),
  },
  update: {
    body: zod.object({
      title: zod.optional(string.max(255)),
      description: zod.optional(string.max(1000)),
      category: zod.optional(string.max(255)),
      resolved: zod.optional(boolean),
    }),
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

export default {
  user,
  auth,
  slot,
  student,
  tutor,
  call,
  rating: ratings,
  subscription,
  chat,
  plan,
  coupon,
  invite,
  report,
  reportReply,
};

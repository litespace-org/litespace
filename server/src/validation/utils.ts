import { passwordRegex } from "@/constants";
import { IUser, ISlot, ISubscription, ICall } from "@litespace/types";
import zod from "zod";

export const id = zod.coerce.number({ message: "Invalid id" }).positive();

export const password = zod
  .string({ message: "Invalid password" })
  .regex(passwordRegex, "Password doesn't meet the requirements");

export const email = zod.string().trim().email("Invalid email");

export const gender = zod.enum([IUser.Gender.Male, IUser.Gender.Female]);

export const name = zod.string().trim().min(3, "Invalid username");

export const rating = zod.coerce.number().positive().int().min(1).max(5);

export const string = zod.string().trim();

export const optionalString = zod.optional(string);

export const weekday = zod.coerce.number().min(-1).max(6);

export const time = zod.string().time();

export const date = zod.coerce.string().date();

export const datetime = zod.coerce.string().datetime();

export const repeat = zod.enum([
  ISlot.Repeat.No,
  ISlot.Repeat.Daily,
  ISlot.Repeat.Weekly,
  ISlot.Repeat.Monthly,
]);

export const userType = zod.enum([
  IUser.Type.SuperAdmin,
  IUser.Type.RegularAdmin,
  IUser.Type.Tutor,
  IUser.Type.Student,
]);

export const callType = zod.enum([ICall.Type.Interview, ICall.Type.Lesson]);

export const url = zod.string().url().trim();

export const callSize = zod.enum([ICall.Size.Short, ICall.Size.Long]);

export const subscriptionPeriod = zod.enum([
  ISubscription.Period.Month,
  ISubscription.Period.Quarter,
  ISubscription.Period.Year,
]);

export const identityObject = zod.object({ id });

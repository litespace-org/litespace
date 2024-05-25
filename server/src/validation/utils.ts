import { passwordRegex } from "@/constants";
import { Slot, Subscription } from "@/models";
import zod from "zod";

export const id = zod.coerce.number({ message: "Invalid id" }).positive();

export const password = zod
  .string({ message: "Invalid password" })
  .regex(passwordRegex, "Password doesn't meet the requirements");

export const email = zod.string().trim().email("Invalid email");

export const name = zod.string().trim().min(3, "Invalid username");

export const rating = zod.coerce.number().positive().int().min(1).max(5);

export const string = zod.string().trim();

export const optionalString = zod.optional(string);

export const weekday = zod.coerce.number().min(-1).max(6);

export const time = zod.string().time();

export const date = zod.coerce.string().date();

export const datetime = zod.coerce.string().datetime();

export const repeat = zod.enum([
  Slot.Repeat.No,
  Slot.Repeat.Daily,
  Slot.Repeat.Weekly,
  Slot.Repeat.Monthly,
]);

export const url = zod.string().url().trim();

export const subscriptionPeriod = zod.enum([
  Subscription.Period.Month,
  Subscription.Period.Quarter,
  Subscription.Period.Year,
]);

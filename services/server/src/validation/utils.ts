import { passwordRegex } from "@/constants";
import {
  IUser,
  IRule,
  ISubscription,
  IDate,
  StringLiteral,
  IInterview,
  ILesson,
  IWithdrawMethod,
  IInvoice,
  banks,
  IFilter,
} from "@litespace/types";
import zod from "zod";

export const id = zod.coerce.number({ message: "Invalid id" }).positive();

export const ids = zod.array(id);

export const sessionId = zod
  .string()
  .startsWith("lesson:")
  .or(zod.string().startsWith("interview:"));

export const password = zod
  .string({ message: "Invalid password" })
  .regex(passwordRegex, "Password doesn't meet the requirements");

export const email = zod.string().trim().email("Invalid email");

export const gender = zod.enum([IUser.Gender.Male, IUser.Gender.Female]);

export const name = zod.string().trim().min(3, "Invalid name");

export const rating = zod.coerce.number().positive().int().min(1).max(5);

export const string = zod.string().trim();

export const number = zod.coerce.number();

export const boolean = zod.boolean();

export const jsonBoolean = zod
  .custom<"true" | "false">((value) => value === "true" || value === "false")
  .transform((value) => value === "true");

export const orderDirection = zod.enum([
  IFilter.OrderDirection.Ascending,
  IFilter.OrderDirection.Descending,
]);

export const optionalString = zod.optional(string);

export const weekday = zod
  .enum([
    IDate.Weekday.Monday.toString(),
    IDate.Weekday.Tuesday.toString(),
    IDate.Weekday.Wednesday.toString(),
    IDate.Weekday.Thursday.toString(),
    IDate.Weekday.Friday.toString(),
    IDate.Weekday.Saturday.toString(),
    IDate.Weekday.Sunday.toString(),
  ])
  .pipe(zod.coerce.number());

export const duration = zod.union([
  zod.literal(ILesson.Duration.Short),
  zod.literal(ILesson.Duration.Long),
]);

export const monthday = zod.coerce.number().min(1).max(31);

export const time = zod.string().time();

export const date = zod.coerce.string().date();

const year = new Date().getFullYear();

export const birthYear = zod.coerce
  .number()
  .max(year)
  .min(year - 80);

export const datetime = zod.coerce.string().datetime();

export const repeat = zod.enum([
  IRule.Repeat.No,
  IRule.Repeat.Daily,
  IRule.Repeat.Weekly,
  IRule.Repeat.Monthly,
]);

export const role = zod.enum([
  IUser.Role.SuperAdmin,
  IUser.Role.RegularAdmin,
  IUser.Role.TutorManager,
  IUser.Role.Studio,
  IUser.Role.Tutor,
  IUser.Role.Student,
]);

export const url = zod.string().url().trim();

export const subscriptionPeriod = zod.enum([
  ISubscription.Period.Month,
  ISubscription.Period.Quarter,
  ISubscription.Period.Year,
]);

export const interviewStatus = zod.enum([
  IInterview.Status.Pending,
  IInterview.Status.Passed,
  IInterview.Status.Rejected,
  IInterview.Status.Canceled,
]);

export const withdrawMethod = zod.enum([
  IWithdrawMethod.Type.Wallet,
  IWithdrawMethod.Type.Bank,
  IWithdrawMethod.Type.Instapay,
]);

export const invoiceStatus = zod.enum([
  IInvoice.Status.Pending,
  IInvoice.Status.CanceledByReceiver,
  IInvoice.Status.CancellationApprovedByAdmin,
  IInvoice.Status.Fulfilled,
  IInvoice.Status.Rejected,
  IInvoice.Status.UpdatedByReceiver,
]);

export const bank = zod.enum(banks);

export const identityObject = zod.object({ id });

export function withNamedId<T>(key: StringLiteral<T>) {
  return zod.object({ [key]: id }) as zod.ZodObject<{
    [P in StringLiteral<T>]: Zod.ZodNumber;
  }>;
}

export const pageNumber = zod.coerce.number().positive().min(1).int();
export const pageSize = zod.coerce.number().positive().min(1).int();

export const pagination = zod.object({
  page: zod.optional(pageNumber).default(1),
  size: zod.optional(pageSize).default(10),
});

export const skippablePagination = zod.object({
  page: zod.optional(pageNumber).default(1),
  size: zod.optional(pageSize).default(10),
  full: zod.optional(boolean).default(false),
});

import {
  IUser,
  IDate,
  StringLiteral,
  IInterview,
  ILesson,
  IInvoice,
  BANKS,
  IFilter,
  IPlan,
} from "@litespace/types";
import zod, { ZodLiteral } from "zod";

export const id = zod.coerce.number({ message: "Invalid id" }).positive();

export const ids = zod.array(id);

export const email = zod.string().trim().toLowerCase().email("Invalid email");

export const gender = zod.enum([IUser.Gender.Male, IUser.Gender.Female]);

export const name = zod.string().trim().min(3, "Invalid name");

export const rating = zod.coerce.number().positive().int().min(1).max(5);

export const string = zod.string().trim();

export const number = zod.coerce.number();

export const boolean = zod.boolean();

export const jsonBoolean = zod
  .custom<"true" | "false">((value) => value === "true" || value === "false")
  .transform((value) => value === "true");

export const orderDirection = unionOfLiterals<IFilter.Direction>([
  "acs",
  "desc",
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

export const role = zod.nativeEnum(IUser.Role);

export const url = zod.string().url().trim();

export const planPeriod = zod.nativeEnum(IPlan.Period);

export const interviewStatus = zod.coerce.number(
  zod.nativeEnum(IInterview.Status)
);

export const withdrawMethod = zod.nativeEnum(IInvoice.WithdrawMethod);

export const invoiceStatus = zod.nativeEnum(IInvoice.Status);

export const banks = zod.enum(BANKS);

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

export function unionOfLiterals<T extends string | number>(
  constants: readonly T[]
) {
  const literals = constants.map((x) => zod.literal(x)) as unknown as readonly [
    ZodLiteral<T>,
    ZodLiteral<T>,
    ...ZodLiteral<T>[],
  ];
  return zod.union(literals);
}

export const numericFilter = zod.union([
  zod.coerce.number(),
  zod.object({
    gte: zod.number().optional(),
    lte: zod.coerce.number().optional(),
    gt: zod.coerce.number().optional(),
    lt: zod.coerce.number().optional(),
  }),
]);

export const dateFilter = zod.union([
  zod.string(),
  zod.object({
    gte: zod.string().optional(),
    lte: zod.string().optional(),
    gt: zod.string().optional(),
    lt: zod.string().optional(),
  }),
]);

export const queryBoolean = zod
  .custom<
    "true" | "false" | true | false
  >((value) => value === "true" || value === "false" || value === true || value === false)
  .transform((value) => value === "true" || value === true);

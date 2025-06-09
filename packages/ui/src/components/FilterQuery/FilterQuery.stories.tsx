import type { Meta, StoryObj } from "@storybook/react";
import { FilterQuery } from "@/components/FilterQuery/FilterQuery";
import zod from "zod";
import { IUser } from "@litespace/types";

type Component = typeof FilterQuery;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "FilterQuery",
  component: FilterQuery,
};

const numericFilter = zod.union([
  zod.coerce.number(),
  zod.object({
    gte: zod.number().optional(),
    lte: zod.coerce.number().optional(),
    gt: zod.coerce.number().optional(),
    lt: zod.coerce.number().optional(),
  }),
]);

const dateFilter = zod.union([
  zod.string(),
  zod.object({
    gte: zod.string().optional(),
    lte: zod.string().optional(),
    gt: zod.string().optional(),
    lt: zod.string().optional(),
  }),
]);

const findFullTutorsQuery = zod.object({
  bio: zod
    .union([zod.string(), zod.null()])
    .describe("search by tutor bio")
    .optional(),
  about: zod
    .union([zod.string(), zod.null()])
    .optional()
    .describe("search by tutor about"),
  name: zod
    .union([zod.string(), zod.null()])
    .optional()
    .describe("search by tutor name"),
  phone: zod
    .union([zod.string(), zod.null()])
    .optional()
    .describe("search by tutor phone number"),
  email: zod.string().optional().describe("search by tutor email"),
  video: zod
    .boolean()
    .optional()
    .describe("filter by tutor having video or not"),
  thumbnail: zod
    .boolean()
    .optional()
    .describe("filter by tutor having thumbnail or not"),
  image: zod
    .boolean()
    .optional()
    .describe("filter by tutor having image or not"),
  activated: zod
    .boolean()
    .optional()
    .describe("filter by tutor either activated or not"),
  verifiedEmail: zod
    .boolean()
    .optional()
    .describe("filter by tutor either verified their email or not"),
  verifiedPhone: zod
    .boolean()
    .optional()
    .describe("filter by tutor either verified their phone or not"),
  verifiedWhatsapp: zod
    .boolean()
    .optional()
    .describe("filter by tutor either verified their whatsapp or not"),
  verifiedTelegram: zod
    .boolean()
    .optional()
    .describe("filter by tutor either verified their telegram or not"),
  password: zod
    .boolean()
    .optional()
    .describe("filter by tutor either having password or not"),
  notice: numericFilter.optional().describe("filter by tutors notice period"),
  birthYear: numericFilter.describe("filter by tutor birth year").optional(),
  notificationMethod: zod
    .nativeEnum(IUser.NotificationMethod)
    .array()
    .optional()
    .describe("filter by a list of available notification methods"),
  city: zod
    .nativeEnum(IUser.City)
    .array()
    .optional()
    .describe("filter by a list of available cities"),
  gender: zod
    .nativeEnum(IUser.Gender)
    .array()
    .optional()
    .describe("filter by a list of available cities"),
  createdAt: dateFilter.optional().describe("filter by tutors created at date"),
  page: zod.number().optional().default(1).describe("set page number"),
  size: zod.number().optional().default(10).describe("set page size"),
});

export const Primary: Story = {
  args: {
    id: "find-tutors-query-test",
    schema: findFullTutorsQuery,
    onSubmit(filter) {
      console.log(filter);
    },
  },
};

export default meta;

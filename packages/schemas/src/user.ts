import zod from "zod";
import { IUser } from "@litespace/types";

import {
  pageNumber,
  pageSize,
  numericFilter,
  dateFilter,
  queryBoolean,
} from "@/utils";

import { paginationDefaults } from "@/constants";

export const findFullTutorsQuery = zod.object({
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
  video: queryBoolean
    .optional()
    .describe("filter by tutor having video or not"),
  thumbnail: queryBoolean
    .optional()
    .describe("filter by tutor having thumbnail or not"),
  image: queryBoolean
    .optional()
    .describe("filter by tutor having image or not"),
  activated: queryBoolean
    .optional()
    .describe("filter by tutor either activated or not"),
  verifiedEmail: queryBoolean
    .optional()
    .describe("filter by tutor either verified their email or not"),
  verifiedPhone: queryBoolean
    .optional()
    .describe("filter by tutor either verified their phone or not"),
  verifiedWhatsapp: queryBoolean
    .optional()
    .describe("filter by tutor either verified their whatsapp or not"),
  verifiedTelegram: queryBoolean
    .optional()
    .describe("filter by tutor either verified their telegram or not"),
  password: queryBoolean
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
  page: zod.optional(pageNumber).default(paginationDefaults.page),
  size: zod.optional(pageSize).default(paginationDefaults.size),
});

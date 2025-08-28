import { students, users, knex, confirmationCodes } from "@litespace/models";
import { IUser, IStudent, IConfirmationCode } from "@litespace/types";
import { exists, forbidden, invalidEmail } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { isEmailValid } from "@/lib/validateEmail";
import safeRequest from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import zod, { ZodSchema } from "zod";
import {
  email,
  password,
  string,
  id,
  pageNumber,
  pageSize,
} from "@/validation/utils";
import { encodeAuthJwt } from "@litespace/auth";
import { generateConfirmationCode } from "@/lib/confirmationCodes";
import { CONFIRMATION_CODE_VALIDITY_MINUTES } from "@litespace/utils";
import { environment, jwtSecret } from "@/constants";
import dayjs from "@/lib/dayjs";
import { sendBackgroundMessage } from "@/workers";
import { isAdmin } from "@litespace/utils/user";

const createStudentPayload: ZodSchema<IStudent.CreateApiPayload> = zod.object({
  email,
  password,
  name: string.optional(),
  jobTitle: string.optional(),
  englishLevel: zod.nativeEnum(IStudent.EnglishLevel).optional(),
  learningObjective: string.optional(),
});

const findStudentsQuery: ZodSchema<IStudent.FindModelQuery> = zod.object({
  ids: id.array().optional(),
  jobTitle: string.optional(),
  englishLevels: zod.nativeEnum(IStudent.EnglishLevel).array().optional(),
  learningObjective: string.optional(),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  const payload: IStudent.CreateApiPayload = createStudentPayload.parse(
    req.body
  );

  const userObject = await users.findByEmail(payload.email);
  if (userObject) return next(exists.user());

  if (environment !== "local") {
    const validEmail = await isEmailValid(payload.email);
    if (!validEmail) return next(invalidEmail());
  }

  const { user, student } = await knex.transaction(async (tx) => {
    const user = await users.create(
      {
        role: IUser.Role.Student,
        email: payload.email,
        password: hashPassword(payload.password),
        name: payload.name,
      },
      tx
    );

    const student = await students.create(
      {
        userId: user.id,
        jobTitle: payload.jobTitle || null,
        englishLevel: payload.englishLevel || null,
        learningObjective: payload.learningObjective || null,
      },
      tx
    );

    return { user, student };
  });

  const { code } = await confirmationCodes.create({
    userId: user.id,
    purpose: IConfirmationCode.Purpose.VerifyEmail,
    code: generateConfirmationCode(),
    expiresAt: dayjs
      .utc()
      .add(CONFIRMATION_CODE_VALIDITY_MINUTES, "minutes")
      .toISOString(),
  });

  sendBackgroundMessage({
    type: "send-user-verification-code-email",
    payload: { code, email: user.email },
  });

  const token = encodeAuthJwt(user.id, jwtSecret);
  const response: IStudent.CreateApiResponse = { user, student, token };
  res.status(200).json(response);
}

export async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const query: IStudent.FindModelQuery = findStudentsQuery.parse(req.query);
  const result = await students.findMany(query);
  res.status(200).json(result);
}

export default {
  create: safeRequest(create),
  find: safeRequest(find),
};

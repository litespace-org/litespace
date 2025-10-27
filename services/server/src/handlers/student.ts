import { students, users, knex, confirmationCodes } from "@litespace/models";
import { IUser, IStudent, IConfirmationCode } from "@litespace/types";
import { exists, forbidden, invalidEmail } from "@/lib/error/api";
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
  studentEnglishLevel,
  timePeriod,
  withNamedId,
  dateFilter,
} from "@/validation/utils";
import { encodeAuthJwt } from "@litespace/auth";
import { generateConfirmationCode } from "@/lib/confirmationCodes";
import { CONFIRMATION_CODE_VALIDITY_MINUTES } from "@litespace/utils";
import { environment, jwtSecret } from "@/constants";
import dayjs from "@/lib/dayjs";
import { sendBackgroundMessage } from "@/workers";
import { isAdmin, isStudent, isTutor } from "@litespace/utils/user";
import { sendMsg } from "@/lib/messenger";

const createStudentPayload: ZodSchema<IStudent.CreateApiPayload> = zod.object({
  email,
  password,
  jobTitle: string.optional(),
  englishLevel: studentEnglishLevel.optional(),
  timePeriod: timePeriod.optional(),
  learningObjective: string.optional(),
});

const updateStudentSchema: ZodSchema<IStudent.UpdateApiPayload> = zod.object({
  id,
  jobTitle: string.optional(),
  englishLevel: zod.coerce.number(studentEnglishLevel).optional(),
  learningObjective: string.optional(),
  timePeriod: zod.coerce.number(timePeriod).optional(),
});

const findStudentsQuery: ZodSchema<IStudent.FindApiQuery> = zod.object({
  ids: id.array().optional(),
  jobTitle: string.optional(),
  englishLevels: studentEnglishLevel.array().optional(),
  timePeriods: timePeriod.array().optional(),
  learningObjective: string.optional(),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

const sendAdMessagePayload: ZodSchema<IStudent.SendAdMessageApiPayload> =
  zod.object({
    createdAt: dateFilter,
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
      },
      tx
    );

    const student = await students.create({
      userId: user.id,
      jobTitle: payload.jobTitle || null,
      englishLevel: payload.englishLevel || null,
      learningObjective: payload.learningObjective || null,
      timePeriod: payload.timePeriod || null,
      tx,
    });

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
  const response: IStudent.CreateApiResponse = {
    user: { ...user, ...student },
    token,
  };
  res.status(200).json(response);
}

// TODO: make it more general; in the sense that it can be used
// to update both student and user info.
async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const payload: IStudent.UpdateApiPayload = updateStudentSchema.parse(
    req.body
  );
  if (user.id !== payload.id) return next(forbidden());

  await students.update(payload);

  res.sendStatus(200);
}

export async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isStudent(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const query: IStudent.FindApiQuery = findStudentsQuery.parse(req.query);
  const result = await students.find(query);
  res.status(200).json(result);
}

export async function findById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isAdmin(user) || isStudent(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const { id }: IStudent.FindByIdApiQuery = withNamedId("id").parse(req.params);
  const result = await students.findById(id);
  res.status(200).json(result);
}

export async function sendAdMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload = sendAdMessagePayload.parse(req.body);
  const result = await users.find({
    role: IUser.Role.Student,
    createdAt: payload.createdAt,
    full: true,
  });

  const students = result.list.filter((s) => s.phone);

  await Promise.all(
    students.map((student) =>
      student.phone
        ? sendMsg(
            {
              to: student.phone,
              template: {
                name: "ad_message",
                parameters: {},
              },
              method: IUser.NotificationMethod.Whatsapp,
            },
            true
          )
        : undefined
    )
  );

  const response: IStudent.SendAdMessageApiResponse = {
    count: students.length,
  };
  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  update: safeRequest(update),
  find: safeRequest(find),
  findById: safeRequest(findById),
  sendAdMessage: safeRequest(sendAdMessage),
};

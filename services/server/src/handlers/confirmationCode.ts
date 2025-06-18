import {
  bad,
  emailAlreadyVerified,
  expiredVerificationCode,
  forbidden,
  invalidVerificationCode,
  notfound,
  unresolvedPhone,
} from "@/lib/error";
import { confirmationCodes, knex, users } from "@litespace/models";
import { IConfirmationCode, IUser } from "@litespace/types";
import {
  isUser,
  CONFIRMATION_CODE_VALIDITY_MINUTES,
  NOTIFICATION_METHOD_LITERAL_TO_KAFKA_TOPIC,
  NOTIFICATION_METHOD_LITERAL_TO_ENUM,
  NOTIFICATION_METHOD_LITERAL_TO_PURPOSE,
  safePromise,
} from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import zod, { ZodSchema } from "zod";
import dayjs from "@/lib/dayjs";
import safeRequest from "express-async-handler";
import { first } from "lodash";
import { generateConfirmationCode } from "@/lib/confirmationCodes";
import { messenger } from "@/lib/messenger";
import { producer } from "@/lib/kafka";
import { unionOfLiterals, email, password } from "@/validation/utils";
import { sendBackgroundMessage } from "@/workers";
import { hashPassword, selectPhone } from "@/lib/user";

const method = unionOfLiterals<IUser.NotificationMethodLiteral>([
  "whatsapp",
  "telegram",
]);

const sendVerifyPhoneCodePayload: ZodSchema<IConfirmationCode.SendVerifyPhoneCodeApiPayload> =
  zod.object({
    phone: zod.string().optional(),
    method,
  });

const verifyPhoneCodePayload: ZodSchema<IConfirmationCode.VerifyPhoneCodeApiPayload> =
  zod.object({
    code: zod.number(),
    method,
  });

const sendCodePayload = zod.object({ email });

const confirmForgetPasswordCodePayload: ZodSchema<IConfirmationCode.ConfirmForgetPasswordCodeApiPayload> =
  zod.object({
    password,
    code: zod.number(),
  });

const verifyEmailPayload: ZodSchema<IConfirmationCode.VerifyEmailApiPayload> =
  zod.object({
    code: zod.number(),
  });

async function sendVerifyPhoneCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const payload = sendVerifyPhoneCodePayload.parse(req.body);

  const { update, valid, phone } = selectPhone(user.phone, payload.phone);
  if (!valid || !phone) return next(bad("invalid or missing phone number"));
  // update user phone if needed.
  if (update) await users.update(user.id, { phone });

  const purpose = NOTIFICATION_METHOD_LITERAL_TO_PURPOSE[payload.method];

  // Remove any confirmation code that belongs to the current user under the same
  // purpose. This way users will only have one code under a given purpose at
  // any point of time.
  await confirmationCodes.delete({
    users: [user.id],
    purposes: [purpose],
  });

  const expiresAt = dayjs
    .utc()
    .add(CONFIRMATION_CODE_VALIDITY_MINUTES, "minutes")
    .toISOString();

  // Store the new code in the db
  const code = await confirmationCodes.create({
    userId: user.id,
    purpose,
    code: generateConfirmationCode(),
    expiresAt: expiresAt,
  });

  // If the method is telegram; we need to resolve the number first with telegram Api
  const resolvedPhone =
    payload.method !== "telegram" ||
    (await safePromise(
      messenger.telegram.resolvePhone({ phone }).then((phone) => !!phone)
    ));
  if (!resolvedPhone) return next(unresolvedPhone());

  // Send the notification using Kafka Producer
  const topic = NOTIFICATION_METHOD_LITERAL_TO_KAFKA_TOPIC[payload.method];
  await producer.send({
    topic,
    messages: [
      {
        value: {
          to: phone,
          expiresAt,
          message: `LiteSpace here! Your verification code: ${code.code}. Please note this code is only valid for the next ${CONFIRMATION_CODE_VALIDITY_MINUTES} minutes. If you didn't ask for this, no action is needed.`,
        },
      },
    ],
  });

  res.sendStatus(200);
}

async function verifyPhoneCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!isUser(user)) return next(forbidden());

  const { code, method } = verifyPhoneCodePayload.parse(req.body);

  const confirmationCodeList = await confirmationCodes.find({
    code,
    userId: user.id,
    purpose: NOTIFICATION_METHOD_LITERAL_TO_PURPOSE[method],
  });

  const confirmationCode = first(confirmationCodeList);
  if (!confirmationCode) return next(invalidVerificationCode());

  const now = dayjs.utc();
  const isExpired = dayjs.utc(confirmationCode.expiresAt).isBefore(now);

  if (isExpired) {
    await confirmationCodes.deleteById({ id: confirmationCode.id });
    return next(expiredVerificationCode());
  }

  const verifiedTelegram = method === "telegram" || user.verifiedTelegram;
  const verifiedWhatsApp = method === "whatsapp" || user.verifiedWhatsApp;

  await knex.transaction(async (tx) => {
    await confirmationCodes.deleteById({ tx, id: confirmationCode.id });

    await users.update(
      user.id,
      {
        verifiedPhone: true,
        notificationMethod: NOTIFICATION_METHOD_LITERAL_TO_ENUM[method],
        verifiedWhatsApp,
        verifiedTelegram,
      },
      tx
    );
  });

  res.sendStatus(200);
}

/**
 * @description generates a random code, sets it in the database and sends it to
 * the user by email.
 */
async function sendForgetPasswordCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = sendCodePayload.parse(req.body);

  const user = await users.findByEmail(email);
  if (!user) return next(notfound.user());

  // remove any confirmation code that belongs to the current user
  // under the same purpose
  await confirmationCodes.delete({
    users: [user.id],
    purposes: [IConfirmationCode.Purpose.ResetPassword],
  });

  // generate and store the new code in the db
  const { code } = await confirmationCodes.create({
    userId: user.id,
    purpose: IConfirmationCode.Purpose.ResetPassword,
    code: generateConfirmationCode(),
    expiresAt: dayjs
      .utc()
      .add(CONFIRMATION_CODE_VALIDITY_MINUTES, "minutes")
      .toISOString(),
  });

  sendBackgroundMessage({
    type: "send-forget-password-code-email",
    payload: { email: user.email, code },
  });

  res.status(200).send();
}

async function confirmForgetPasswordCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { password, code } = confirmForgetPasswordCodePayload.parse(req.body);

  const list = await confirmationCodes.find({
    code,
    purpose: IConfirmationCode.Purpose.ResetPassword,
  });

  const confirmationCode = first(list);
  if (!confirmationCode || !confirmationCode.userId)
    return next(invalidVerificationCode());

  const now = dayjs.utc();
  const isExpired = dayjs.utc(confirmationCode.expiresAt).isBefore(now);

  if (isExpired) {
    await confirmationCodes.deleteById({ id: confirmationCode.id });
    return next(expiredVerificationCode());
  }

  await knex.transaction(async (tx) => {
    if (!confirmationCode.userId)
      throw new Error(
        "Missing confirmation code user id, should never happen."
      );

    await users.update(
      confirmationCode.userId,
      { password: hashPassword(password) },
      tx
    );
    await confirmationCodes.deleteById({ id: confirmationCode.id, tx });
  });

  res.sendStatus(200);
}

async function sendEmailVerificationCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  if (user.verifiedEmail) return next(emailAlreadyVerified());

  // generate and store the new code in the db
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

  res.sendStatus(200);
}

/**
 * @note verify email confirmation code and mark email as verified.
 */
async function confirmEmailVerificationCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());
  if (user.verifiedEmail) return next(emailAlreadyVerified());

  // get the code from the payload and verify it
  const { code } = verifyEmailPayload.parse(req.body);

  const list = await confirmationCodes.find({
    purpose: IConfirmationCode.Purpose.VerifyEmail,
    userId: user.id,
    code,
  });

  const confirmationCode = first(list);
  if (!confirmationCode || !confirmationCode.userId)
    return next(invalidVerificationCode());

  const now = dayjs.utc();
  const isExpired = dayjs.utc(confirmationCode.expiresAt).isBefore(now);

  if (isExpired) {
    await confirmationCodes.deleteById({ id: confirmationCode.id });
    return next(expiredVerificationCode());
  }

  // update the database to mark the email as verified
  await users.update(user.id, { verifiedEmail: true });

  res.sendStatus(200);
}

export default {
  sendVerifyPhoneCode: safeRequest(sendVerifyPhoneCode),
  verifyPhoneCode: safeRequest(verifyPhoneCode),
  sendForgetPasswordCode: safeRequest(sendForgetPasswordCode),
  confirmForgetPasswordCode: safeRequest(confirmForgetPasswordCode),
  sendEmailVerificationCode: safeRequest(sendEmailVerificationCode),
  confirmEmailVerificationCode: safeRequest(confirmEmailVerificationCode),
};

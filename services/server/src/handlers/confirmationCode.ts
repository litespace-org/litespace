import {
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
} from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import safeRequest from "express-async-handler";
import { first } from "lodash";
import { generateConfirmationCode, selectPhone } from "@/lib/confirmationCodes";
import { messenger } from "@/lib/messenger";
import { producer } from "@/lib/kafka";
import { id, unionOfLiterals, email } from "@/validation/utils";
import { sendBackgroundMessage } from "@/workers";
import { jwtSecret } from "@/constants";
import { encodeAuthJwt } from "@litespace/auth";

const method = unionOfLiterals<IUser.NotificationMethodLiteral>([
  "whatsapp",
  "telegram",
]);

const sendVerifyNotificationMethodCodePayload = zod.object({
  phone: zod.string().optional(),
  method,
});

const verifyNotificationMethodCodePayload = zod.object({
  code: zod.number(),
  method,
});

const sendCodePayload = zod.object({ email });

const confirmPasswordCodePayload = zod.object({
  userId: id,
  code: zod.number(),
});

const verifyEmailPayload = zod.object({
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

  const payload: IConfirmationCode.SendVerifyPhoneCodePayload =
    sendVerifyNotificationMethodCodePayload.parse(req.body);

  const phone = selectPhone(user.phone, payload.phone);
  if (phone instanceof Error) return next(phone);
  if (!user.phone) await users.update(user.id, { phone });

  const purpose = NOTIFICATION_METHOD_LITERAL_TO_PURPOSE[payload.method];

  // Remove any confirmation code that belongs to the current user under the same
  // purpose. This way users will only have one code under a given purpose at
  // any point of time.
  await confirmationCodes.delete({
    users: [user.id],
    purposes: [purpose],
  });

  // Store the new code in the db
  const code = await confirmationCodes.create({
    userId: user.id,
    purpose,
    code: generateConfirmationCode(),
    expiresAt: dayjs
      .utc()
      .add(CONFIRMATION_CODE_VALIDITY_MINUTES, "minutes")
      .toISOString(),
  });

  // If the method is telegram; we need to resolve the number first with telegram Api
  const resolvedPhone =
    payload.method !== "telegram" ||
    (await messenger.telegram.resolvePhone({ phone }).then((phone) => !!phone));
  if (!resolvedPhone) return next(unresolvedPhone());

  // Send the notification using Kafka Producer
  const topic = NOTIFICATION_METHOD_LITERAL_TO_KAFKA_TOPIC[payload.method];
  await producer.send({
    topic,
    messages: [
      {
        value: {
          to: phone,
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

  const { code, method }: IConfirmationCode.VerifyPhoneCodePayload =
    verifyNotificationMethodCodePayload.parse(req.body);

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
 * This handler generates a random code, sets it in the database
 * and sends it to the user by mail.
 */
async function sendForgottenPasswordCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email }: IConfirmationCode.SendCodeEmailPayload =
    sendCodePayload.parse(req.body);

  const user = await users.findByEmail(email);
  if (!user) return next(notfound.user());

  // Remove any confirmation code that belongs to the current user
  // under the same purpose
  await confirmationCodes.delete({
    users: [user.id],
    purposes: [IConfirmationCode.Purpose.ResetPassword],
  });

  // Generate and store the new code in the db
  const { code } = await confirmationCodes.create({
    userId: user.id,
    purpose: IConfirmationCode.Purpose.ResetPassword,
    code: generateConfirmationCode(),
    expiresAt: dayjs
      .utc()
      .add(CONFIRMATION_CODE_VALIDITY_MINUTES, "minutes")
      .toISOString(),
  });

  if (user) {
    sendBackgroundMessage({
      type: "send-forget-password-code-email",
      payload: { email: user.email, code },
    });
  }

  res.status(200).send();
}

/**
 * This handler gets a userId and code from users, verify the validity of the code
 * and generates, then send, a token, to the user, in order to be able to reset
 * the password.
 */
async function confirmForgottenPasswordCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId, code }: IConfirmationCode.ConfirmPasswordCodePayload =
    confirmPasswordCodePayload.parse(req.body);

  const user = await users.findById(userId);
  if (!user) return next(notfound.user());

  // Check if the code is valid (exists in the db)
  const found = (
    await confirmationCodes.find({
      userId: user.id,
      purpose: IConfirmationCode.Purpose.ResetPassword,
    })
  )[0];

  // TODO: count the number of tries, then block using this handler for while
  // for this specific userId, after a specific number of tries.
  if (!found || found.code !== code) return next(invalidVerificationCode());

  // Ensure the code is not expired
  if (dayjs.utc(found.expiresAt).isBefore(dayjs.utc())) {
    await confirmationCodes.deleteById({ id: found.id });
    return next(expiredVerificationCode());
  }

  // This token should be used by frontend reset password page
  // in order to be able to change the password
  const token = encodeAuthJwt(userId, jwtSecret);

  // Remove the confirmation code for more data integridy and security
  await confirmationCodes.deleteById({ id: found.id });

  const response: IConfirmationCode.ConfirmPasswordCodeApiResponse = { token };
  res.status(200).json(response);
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

  // Generate and store the new code in the db
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
    payload: {
      code,
      email: user.email,
    },
  });

  res.status(200).send();
}

/**
 * Despite the name, this function verify the email in the db as well
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
  const { code }: IConfirmationCode.VerifyEmailPayload =
    verifyEmailPayload.parse(req.body);

  const found = (
    await confirmationCodes.find({
      userId: user.id,
      purpose: IConfirmationCode.Purpose.VerifyEmail,
    })
  )[0];

  // TODO: count the number of tries, then block using this handler for while
  // for this specific userId, after a specific number of tries.
  if (!found || found.code !== code) return next(invalidVerificationCode());

  // Ensure the code is not expired
  if (dayjs.utc(found.expiresAt).isBefore(dayjs.utc())) {
    await confirmationCodes.deleteById({ id: found.id });
    return next(expiredVerificationCode());
  }

  // update the database to mark the email as verified
  await users.update(user.id, { verifiedEmail: true });

  res.status(200).send();
}

export default {
  sendVerifyPhoneCode: safeRequest(sendVerifyPhoneCode),
  verifyPhoneCode: safeRequest(verifyPhoneCode),

  sendForgottenPasswordCode: safeRequest(sendForgottenPasswordCode),
  confirmForgottenPasswordCode: safeRequest(confirmForgottenPasswordCode),

  sendEmailVerificationCode: safeRequest(sendEmailVerificationCode),
  confirmEmailVerificationCode: safeRequest(confirmEmailVerificationCode),
};

import {
  bad,
  expiredVerificationCode,
  forbidden,
  invalidVerificationCode,
  unresolvedPhone,
} from "@/lib/error";
import { confirmationCodes, knex, users } from "@litespace/models";
import { IConfirmationCode, IUser } from "@litespace/types";
import {
  CONFIRMATION_CODE_VALIDITY_MINUTES,
  isUser,
  NOTIFICATION_METHOD_LITERAL_TO_KAFKA_TOPIC,
  NOTIFICATION_METHOD_LITERAL_TO_NOTIFICATION_METHOD,
  NOTIFICATION_METHOD_LITERAL_TO_PURPOSE,
} from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import safeRequest from "express-async-handler";
import { first } from "lodash";
import { generateConfirmationCode } from "@/lib/confirmationCodes";
import { messenger } from "@/lib/messenger";
import { withPhone } from "@/lib/user";
import { producer } from "@/lib/kafka";
import { unionOfLiterals } from "@/validation/utils";

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

async function sendVerifyNotificationMethodCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const payload: IConfirmationCode.SendVerifyNotificationMethodCodePayload =
    sendVerifyNotificationMethodCodePayload.parse(req.body);
  const { valid, update, phone } = withPhone(user.phone, payload.phone);

  if (!valid || !phone) return next(bad("Invalid or missing phone number"));
  if (update) await users.update(user.id, { phone });

  const purpose = NOTIFICATION_METHOD_LITERAL_TO_PURPOSE[payload.method];

  // Remove any confirmation code that blongs to the current user under the same
  // purpose. This way users will only have one code under a given purpose at
  // any given point of time.
  await confirmationCodes.delete({
    users: [user.id],
    purposes: [purpose],
  });

  const code = await confirmationCodes.create({
    userId: user.id,
    purpose,
    code: generateConfirmationCode(),
    expiresAt: dayjs
      .utc()
      .add(CONFIRMATION_CODE_VALIDITY_MINUTES, "minutes")
      .toISOString(),
  });

  const resolvedPhone =
    payload.method !== "telegram" ||
    (await messenger.telegram.resolvePhone({ phone }).then((phone) => !!phone));
  if (!resolvedPhone) return next(unresolvedPhone());

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

async function verifyNotificationMethodCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!isUser(user)) return next(forbidden());

  const {
    code,
    method,
  }: IConfirmationCode.VerifyNotificationMethodCodePayload =
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
        notificationMethod:
          NOTIFICATION_METHOD_LITERAL_TO_NOTIFICATION_METHOD[method],
        verifiedWhatsApp,
        verifiedTelegram,
      },
      tx
    );
  });

  res.sendStatus(200);
}

export default {
  sendVerifyNotificationMethodCode: safeRequest(
    sendVerifyNotificationMethodCode
  ),
  verifyNotificationMethodCode: safeRequest(verifyNotificationMethodCode),
};

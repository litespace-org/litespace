import {
  bad,
  expiredVerificationCode,
  forbidden,
  invalidPhone,
  invalidVerificationCode,
  phoneAlreadyVerified,
  unResolvedPhone,
} from "@/lib/error";
import { confirmationCodes, knex, users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { isUser, isValidPhone, orUndefined } from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import safeRequest from "express-async-handler";
import { first } from "lodash";
import { getPurpose, sendCodeToUser } from "@/lib/confirmationCodes";
import { messenger } from "@/lib/messenger";

const sendCodePayload = zod.object({
  phone: zod.string().optional(),
  method: zod.nativeEnum(IUser.NotificationMethod),
});

const verifyCodePayload = zod.object({
  code: zod.number().min(1000).max(9999),
  method: zod.nativeEnum(IUser.NotificationMethod),
});

async function sendCode(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!isUser(user)) return next(forbidden());

  const targetPhone = user.phone;
  const { phone, method } = sendCodePayload.parse(req.body);

  if (targetPhone && phone !== targetPhone) return next(bad());

  if (!targetPhone && !phone) return next(bad());

  if (user.verifiedPhone) return next(phoneAlreadyVerified());

  const to = phone || targetPhone;
  if (!to) return next(bad());

  const validPhoneNumber = isValidPhone(to);
  if (validPhoneNumber !== true) return next(invalidPhone());

  if (phone && !targetPhone)
    await users.update(user.id, {
      phone,
    });

  if (method === IUser.NotificationMethod.Telegram) {
    sendCodeToUser({ to, id: user.id, method: "whatsapp" });
  }

  if (method === IUser.NotificationMethod.Telegram) {
    const resolvedPhone = await messenger.telegram.resolvePhone({
      phone: to,
    });

    if (!resolvedPhone) return next(unResolvedPhone());

    sendCodeToUser({ to, id: user.id, method: "telegram" });
  }

  res.status(200);
}

async function verifyCode(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!isUser(user)) return next(forbidden());

  const { code, method } = verifyCodePayload.parse(req.body);
  if (!code) return next(bad());

  const confirmationCodeList = await confirmationCodes.find({
    code,
    userId: user.id,
    purpose: orUndefined(getPurpose(method)),
  });

  const confirmationCode = first(confirmationCodeList);
  if (!confirmationCode) return next(invalidVerificationCode());

  const now = dayjs.utc();
  const isExpired = dayjs.utc(confirmationCode.expiresAt).isBefore(now);

  if (isExpired) {
    await confirmationCodes.deleteById({
      id: confirmationCode.id,
    });
    return next(expiredVerificationCode());
  }

  await knex.transaction(async (tx) => {
    await confirmationCodes.deleteById({
      tx,
      id: confirmationCode.id,
    });

    await users.update(
      user.id,
      {
        verifiedPhone: true,
        notificationMethod: method,
      },
      tx
    );
  });

  res.status(200);
}

export default {
  sendCode: safeRequest(sendCode),
  verifyCode: safeRequest(verifyCode),
};

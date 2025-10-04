import { NextFunction, Request, Response } from "express";
import zod, { ZodSchema } from "zod";
import { string } from "@/validation/utils";
import safeRequest from "express-async-handler";
import { IContactRequest } from "@litespace/types";
import { contactRequests } from "@litespace/models";
import { environment, telegramConfig } from "@/constants";
import { telegram } from "@/lib/telegram";
import {
  isValidContactRequestMessage,
  isValidContactRequestTitle,
  isValidPhone,
  isValidUserName,
  safe,
} from "@litespace/utils";
import { apierror } from "@/lib/error/api";

const createPayload: ZodSchema<IContactRequest.CreateContactRequestApiPayload> =
  zod.object({
    name: string,
    phone: string,
    title: string,
    message: string,
  });

async function create(req: Request, res: Response, next: NextFunction) {
  const payload: IContactRequest.CreatePayload = createPayload.parse(req.body);

  const validations = [
    isValidUserName(payload.name),
    isValidPhone(payload.phone),
    isValidContactRequestTitle(payload.title),
    isValidContactRequestMessage(payload.message),
  ];

  for (const result of validations)
    if (result !== true) return next(apierror(result, 400));

  await contactRequests.create([payload]);

  res.sendStatus(200);

  const telegramRes = await safe(async () =>
    telegram.sendMessage({
      chat: telegramConfig.chat,
      text: [
        `*New Contact Request (${environment})*\n`,
        "*Name: *" + `${payload.name}`,
        "*Phone: *" + `${payload.phone}`,
        "*Title: *" + `${payload.title}`,
        "*Message: *" + payload.message,
      ].join("\n"),
    })
  );

  if (telegramRes instanceof Error)
    console.error(
      "contactRequest Handler: couldn't send telegram message.",
      telegramRes
    );
}

export default {
  create: safeRequest(create),
};

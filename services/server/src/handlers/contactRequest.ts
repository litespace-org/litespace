import { NextFunction, Request, Response } from "express";
import zod from "zod";
import { string } from "@/validation/utils";
import safeRequest from "express-async-handler";
import { IContactRequest } from "@litespace/types";
import { contactRequests } from "@litespace/models";
import { telegramConfig } from "@/constants";
import { telegram } from "@/lib/telegram";
import {
  isValidContactRequestMessage,
  isValidContactRequestTitle,
  isValidEmail,
  isValidUserName,
} from "@litespace/utils";
import { apierror } from "@/lib/error";

const createPayload = zod.object({
  name: string,
  email: string,
  title: string,
  message: string,
});

async function create(req: Request, res: Response, next: NextFunction) {
  const payload: IContactRequest.CreatePayload = createPayload.parse(req.body);

  const validations = [
    isValidUserName(payload.name),
    isValidEmail(payload.email),
    isValidContactRequestTitle(payload.title),
    isValidContactRequestMessage(payload.message),
  ];

  for (const result of validations) {
    if (result !== true) return next(apierror(result, 400));
  }

  await contactRequests.create([payload]);

  await telegram.sendMessage({
    chat: telegramConfig.chat,
    text: [
      "*New Contact Request*",
      "```md",
      "# " + payload.title,
      payload.message,
      "```",
      "*Requester Name: *" + `_${payload.name}_`,
      "*Requester Email: *" + `_${payload.email}_`,
    ]
      .filter((line) => !!line)
      .join("\n"),
  });

  res.status(200);
}

export default {
  create: safeRequest(create),
};

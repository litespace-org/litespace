import { NextFunction, Request, Response } from "express";
import zod from "zod";
import { string, email } from "@/validation/utils";
import safeRequest from "express-async-handler";
import { IContactRequest } from "@litespace/types";
import { contactRequests } from "@litespace/models";
import { telegramConfig } from "@/constants";
import { telegram } from "@/lib/telegram";

const createPayload = zod.object({
  name: string,
  email: email,
  title: string,
  message: string,
});

async function create(req: Request, res: Response, _: NextFunction) {
  const payload: IContactRequest.CreatePayload = createPayload.parse(req.body);

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

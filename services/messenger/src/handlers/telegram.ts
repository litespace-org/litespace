import { TelegramClient } from "@litespace/radio";
import { isValidPhone } from "@litespace/utils";
import { Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodIssueCode } from "zod";
import { ITelegram } from "@litespace/types";

const resolvePhonePayload = zod.object({
  phone: zod
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!isValidPhone(value))
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Invalid phone number: ${value}`,
        });
    }),
});

function resolvePhone(telegram: TelegramClient) {
  return safeRequest(async (req: Request, res: Response) => {
    const { phone }: ITelegram.ResolvePhonePayload = resolvePhonePayload.parse(
      req.body
    );
    const user = await telegram.resolvePhone(telegram.asPhoneNumber(phone));
    const response: ITelegram.ResolvePhoneResponse = user;
    res.status(200).json(response);
  });
}

export default {
  resolvePhone,
};

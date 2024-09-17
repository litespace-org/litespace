import { forbidden } from "@/lib/error";
import { withdrawMethod } from "@/validation/utils";
import { authorizer } from "@litespace/auth";
import { NextFunction, Request, Response } from "express";
import safe from "express-async-handler";
import zod from "zod";

const createPayload = zod.object({
  method: withdrawMethod,
  receiver: zod.string(),
  bank: zod.union([zod.string(), zod.null()]),
  amount: zod.coerce.number().int().positive(),
});

async function create(req: Request, res: Response, next: NextFunction) {
  // verify amount
  //    - get the minutes then multiple it by price of one minute
  // verify phone number
  // verify bank number
  // verify instapay name
  const allowed = authorizer().tutor().check(req.user);
  if (!allowed) return next(forbidden());
}

export default {
  create: safe(create),
};

import { notfound } from "@/lib/error";
import { users } from "@litespace/models";
import { logger } from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

const addCardParams = zod.object({
  userId: zod.number(),
});

const addCardPayload = zod.object({
  card: zod.object({
    token: zod.string(),
    creationDate: zod.number(),
    lastFourDigits: zod.string(),
    firstSixDigits: zod.string(),
    brand: zod.string(),
  }),
  statusCode: zod.number(),
  statusDescription: zod.string(),
});

/**
  * this handler shall be used only by fawry.
  * see: https://developer.fawrystaging.com/docs/card-tokens/create-use-token#tooltip-webclient-token
  */
async function addCard(req: Request, res: Response, next: NextFunction) {
  /*
   * This general pattern has been kept here (commented) on purpose,
   * as a reminder that this function is being user by third-party plugin.
   *```
   *  const user = req.user;
   *  const allowed = isRegularUser(user);
   *  if (!allowed) return next(forbidden());
   *```
   */
  const { userId } = addCardParams.parse(req.params);
  const found = await users.exists(userId);
  if (!found) return next(notfound.user());

  const payload = addCardPayload.parse(req.body);

  if (payload.statusCode !== 200)
    logger("fawry-api", userId.toString()).warning(payload.statusDescription);
  else
    logger("fawry-api", userId.toString()).log("has added a card token.");

  res.status(200).send();
}

export default {
  addCard: safeRequest(addCard),
};

import zod from "zod";
import { ITransaction } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { bad, forbidden, notfound } from "@/lib/error";
import { id, withNamedId } from "@/validation/utils";
import { isAdmin, isRegularTutor } from "@litespace/utils/user";
import { transactions } from "@litespace/models";

const findPayload = zod.object({
  id: zod.optional(id),
  users: zod.optional(zod.array(zod.number())),
  amount: zod.optional(zod.number().min(0)),
  status: zod.optional(zod.nativeEnum(ITransaction.Status)),
  paymentMethod: zod.optional(zod.nativeEnum(ITransaction.PaymentMethod)),
  providerRefNum: zod.optional(zod.number()),
  after: zod.optional(zod.string().datetime()),
  before: zod.optional(zod.string().datetime()),
});

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const payload: ITransaction.FindQuery = findPayload.parse(req.body);
  if (isRegularTutor(user)) {
    if (payload.users === undefined) {
      return next(bad());
    }
    const others = payload.users.filter((id) => user.id !== id);
    if (!others || others.length > 0) {
      return next(forbidden());
    }
  }

  const response: ITransaction.FindApiResponse =
    await transactions.find(payload);
  res.status(200).json(response);
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const found = await transactions.findById(id);
  if (!found) return next(notfound.transaction());

  if (isRegularTutor(user) && user.id != found.userId) return next(forbidden());

  const response: ITransaction.Self = found;
  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
  findById: safeRequest(findById),
};

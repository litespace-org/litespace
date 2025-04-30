import zod from "zod";
import { ITransaction } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { forbidden, notfound } from "@/lib/error";
import { id, pageNumber, pageSize, withNamedId } from "@/validation/utils";
import { isAdmin, isStudent } from "@litespace/utils/user";
import { transactions } from "@litespace/models";

const findPayload = zod.object({
  ids: id.array().optional(),
  users: id.array().optional(),
  amount: zod.number().min(0).optional(),
  statuses: zod.nativeEnum(ITransaction.Status).array().optional(),
  paymentMethods: zod.nativeEnum(ITransaction.PaymentMethod).array().optional(),
  providerRefNums: zod.number().array().optional(),
  after: zod.string().datetime().optional(),
  before: zod.string().datetime().optional(),
  page: zod.optional(pageNumber).default(1),
  size: zod.optional(pageSize).default(10),
});

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isStudent(user);
  if (!allowed) return next(forbidden());

  const payload: ITransaction.FindQueryApi = findPayload.parse(req.body);

  const response: ITransaction.FindApiResponse = await transactions.find({
    ...payload,
    users: isStudent(user) ? [user.id] : payload.users,
  });

  res.status(200).json(response);
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isStudent(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const transaction = await transactions.findById(id);
  if (!transaction) return next(notfound.transaction());

  if (isStudent(user) && user.id != transaction.userId)
    return next(forbidden());

  const response: ITransaction.Self = transaction;

  res.status(200).json(response);
}

async function findPending(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const txs = await transactions.find({
    users: [user.id],
    statuses: [ITransaction.Status.New],
  });

  if (txs.total === 0) return next(notfound.transaction());
  const response: ITransaction.Self = txs.list[0];

  res.status(200).json(response);
}

export default {
  findPending: safeRequest(findPending),
  find: safeRequest(find),
  findById: safeRequest(findById),
};

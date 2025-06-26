import { forbidden } from "@/lib/error";
import {
  ids,
  pageNumber,
  pageSize,
  jsonBoolean,
  dateFilter,
} from "@/validation/utils";
import { isAdmin, isRegularTutor } from "@litespace/utils/user";
import { invoices } from "@litespace/models";
import { IIntroVideo, IInvoice } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";

const findPayload: ZodSchema<IIntroVideo.FindApiPayload> = zod.object({
  tutorIds: zod.optional(ids),
  reviewerIds: zod.optional(ids),
  approved: zod.optional(jsonBoolean),
  createdAt: zod.optional(dateFilter),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  const query: IInvoice.FindInvoicesQuery = findPayload.parse(req.body);
  const itsTutor = isRegularTutor(user);
  const allowed = itsTutor || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { list, total } = itsTutor
    ? await invoices.findByUser(user.id)
    : await invoices.find(query);

  const masked = itsTutor
    ? list.map((invoice): IInvoice.Self => ({ ...invoice, receipt: null }))
    : list;

  const response: IInvoice.FindInvoicesApiResponse = {
    list: masked,
    total,
  };

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
};

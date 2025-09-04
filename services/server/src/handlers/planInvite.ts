import { forbidden, notfound } from "@/lib/error";
import { planInvites, plans } from "@litespace/models";
import {
  date,
  id,
  ids,
  pageNumber,
  pageSize,
  withNamedId,
} from "@/validation/utils";
import { IPlanInvites } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { isSuperAdmin } from "@litespace/utils/user";
import zod, { ZodSchema } from "zod";

const createPlanPayload: ZodSchema<IPlanInvites.CreateApiPayload> = zod.object({
  userIds: ids,
  planId: id,
  createdBy: id,
  expiresAt: date.optional(),
});

const updatePlanPayload: ZodSchema<IPlanInvites.UpdateApiPayload> = zod.object({
  ids,
  expiresAt: date.optional(),
});

const findPlansQuery: ZodSchema<IPlanInvites.FindApiQuery> = zod.object({
  ids: ids.optional(),
  userIds: ids.optional(),
  planIds: ids.optional(),
  createdBy: ids.optional(),
  expiresAt: date.optional(),
  page: pageNumber.optional(),
  size: pageSize.optional(),
});

async function find(req: Request, res: Response) {
  const query = findPlansQuery.parse(req.query);
  const results = await planInvites.find(query);
  const response: IPlanInvites.FindApiResponse = results;
  res.status(200).json(response);
}

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isSuperAdmin(user);
  if (!allowed) return next(forbidden());

  const payload = createPlanPayload.parse(req.body);

  const foundPlan = await plans.findById(payload.planId);
  if (!foundPlan) return next(notfound.plan());

  // @galal TODO: ensure that the payload.userId is for a student

  const planInvite = await planInvites.create(payload);

  const response: IPlanInvites.CreateApiResponse = planInvite;
  res.status(200).json(response);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isSuperAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const payload = updatePlanPayload.parse(req.body);

  const found = await planInvites.findById(id);
  if (!found) return next(notfound.plan());

  await planInvites.update(payload);

  const response: IPlanInvites.UpdateApiResponse = null;
  res.status(200).json(response);
}

async function deletePlan(req: Request, res: Response, next: NextFunction) {
  const allowed = isSuperAdmin(req.user);
  if (!allowed) return next(forbidden());
  const { id } = withNamedId("id").parse(req.params);

  await planInvites.deleteById(id);

  res.status(200).send();
}

export default {
  find: safeRequest(find),
  create: safeRequest(create),
  update: safeRequest(update),
  delete: safeRequest(deletePlan),
};

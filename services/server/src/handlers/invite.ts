import { forbidden, notfound } from "@/lib/error";
import { invites } from "@litespace/models";
import {
  datetime,
  email,
  id,
  pagination,
  withNamedId,
} from "@/validation/utils";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";
import { isAdmin, isStudent } from "@litespace/utils/user";
import { IInvite } from "@litespace/types";

const createInvitePayload: ZodSchema<IInvite.CreateApiPayload> = zod.object({
  email,
  planId: id,
  expiresAt: datetime,
});

const updateInvitePayload: ZodSchema<IInvite.UpdateApiPayload> = zod.object({
  email: zod.optional(email),
  planId: zod.optional(id),
  expiresAt: zod.optional(datetime),
});

const findByEmailPayload: ZodSchema<IInvite.FindByEmailApiPayload> = zod.object(
  { email: email }
);

async function createInvite(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload = createInvitePayload.parse(req.body);
  const invite = await invites.create({
    email: payload.email,
    expiresAt: payload.expiresAt,
    planId: payload.planId,
    createdBy: user.id,
  });
  res.status(200).json(invite);
}

async function updateInvite(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());
  const { id } = withNamedId("id").parse(req.params);
  const payload = updateInvitePayload.parse(req.body);
  const invite = await invites.update(id, {
    email: payload.email,
    planId: payload.planId,
    expiresAt: payload.expiresAt,
    updatedBy: user.id,
  });

  res.status(200).json(invite);
}

async function deleteInvite(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());
  const { id } = withNamedId("id").parse(req.params);
  await invites.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());
  const { id } = withNamedId("id").parse(req.params);
  const invite = await invites.findById(id);
  if (!invite) return next(notfound.invite());
  res.status(200).json(invite);
}

async function findByEmail(req: Request, res: Response, next: NextFunction) {
  const payload = findByEmailPayload.parse(req.body);
  const user = req.user;
  const isOwner = isStudent(payload) && payload.email === payload.email;
  const allowed = isAdmin(user) || isOwner;
  if (!allowed) return next(forbidden());

  const invite = await invites.findByEmail(payload.email);
  if (!invite) return next(notfound.invite());
  res.status(200).json(invite);
}

async function findAll(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const query = pagination.parse(req.query);
  const list = await invites.find(query);
  res.status(200).json(list);
}

export default {
  create: safeRequest(createInvite),
  update: safeRequest(updateInvite),
  delete: safeRequest(deleteInvite),
  findById: safeRequest(findById),
  findByEmail: safeRequest(findByEmail),
  findAll: safeRequest(findAll),
};

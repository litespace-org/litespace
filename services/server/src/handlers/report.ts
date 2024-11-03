import { forbidden, notfound } from "@/lib/error";
import { reports } from "@litespace/models";
import {
  boolean,
  identityObject,
  string,
  withNamedId,
} from "@/validation/utils";
import { IReport } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { merge } from "lodash";
import zod from "zod";
import { isAdmin, isUser } from "@litespace/auth";

const createReportPayload = zod.object({
  title: string.max(255),
  description: string.max(1000),
  category: string.max(255),
});

const updateReportPayload = zod.object({
  title: zod.optional(string.max(255)),
  description: zod.optional(string.max(1000)),
  category: zod.optional(string.max(255)),
  resolved: zod.optional(boolean),
});

async function createReport(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const payload: IReport.CreateApiPayload = createReportPayload.parse(req.body);
  const report = await reports.create(merge(payload, { createdBy: user.id }));
  res.status(200).json(report);
}

async function updateReport(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const { id } = withNamedId("id").parse(req.params);
  const report = await reports.findById(id);
  if (!report) return next(notfound.base());

  const owner =
    user &&
    (report.createdBy.id === user.id || report.updatedBy.id === user.id);
  const eligible = (isUser(user) && owner) || isAdmin(user);
  if (!eligible) return next(forbidden());

  const payload: IReport.UpdateApiPayload = updateReportPayload.parse(req.body);
  const updatedReport = await reports.update(
    id,
    merge(payload, { updatedBy: user.id })
  );

  res.status(200).json(updatedReport);
}

async function deleteReport(req: Request, res: Response, next: NextFunction) {
  const { id } = withNamedId("id").parse(req.params);
  const report = await reports.findById(id);
  if (!report) return next(notfound.report());

  const user = req.user;
  const owner =
    user &&
    (user.id === report.createdBy.id || user.id === report.updatedBy.id);
  const eligible = (isUser(user) && owner) || isAdmin(user);
  if (!eligible) return next(forbidden());

  await reports.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const report = await reports.findById(id);
  if (!report) return next(notfound.report());
  res.status(200).json(report);
}

async function findAll(req: Request, res: Response) {
  const list = await reports.findAll();
  res.status(200).json(list);
}

export default {
  create: asyncHandler(createReport),
  update: asyncHandler(updateReport),
  delete: asyncHandler(deleteReport),
  findById: asyncHandler(findById),
  findAll: asyncHandler(findAll),
};

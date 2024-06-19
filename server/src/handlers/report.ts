import { isAdmin } from "@/lib/common";
import { forbidden, notfound } from "@/lib/error";
import { reports, threads } from "@/models";
import http from "@/validation/http";
import { identityObject } from "@/validation/utils";
import { IReport } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { merge } from "lodash";

async function create(req: Request, res: Response) {
  const payload: IReport.CreateApiPayload = http.report.create.body.parse(
    req.body
  );

  const coupon = await reports.create(
    merge(payload, { createdBy: req.user.id })
  );

  res.status(200).json(coupon);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const report = await reports.findById(id);
  if (!report) return next(notfound());

  const payload: IReport.UpdateApiPayload = http.report.update.body.parse(
    req.body
  );

  const coupon = await reports.update(
    id,
    merge(payload, { updatedBy: req.user.id })
  );

  res.status(200).json(coupon);
}

async function delete_(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  await reports.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const report = await reports.findById(id);
  if (!report) return next(notfound());
  res.status(200).json(report);
}

async function findAll(req: Request, res: Response) {
  const list = await reports.findAll();
  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  findAll: asyncHandler(findAll),
};

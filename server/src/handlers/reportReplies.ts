import { notfound } from "@/lib/error";
import { reportReplies, reports } from "@/models";
import http from "@/validation/http";
import { identityObject } from "@/validation/utils";
import { IReportReply } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { merge } from "lodash";

async function create(req: Request, res: Response) {
  const payload: IReportReply.CreateApiPayload =
    http.reportReply.create.body.parse(req.body);

  const coupon = await reportReplies.create(
    merge(payload, { createdBy: req.user.id })
  );

  res.status(200).json(coupon);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);

  const payload: IReportReply.UpdateApiPayload =
    http.reportReply.update.body.parse(req.body);

  const coupon = await reportReplies.update(
    id,
    merge(payload, { updatedBy: req.user.id })
  );

  res.status(200).json(coupon);
}

async function delete_(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  await reportReplies.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const reply = await reportReplies.findById(id);
  if (!reply) return next(notfound());
  res.status(200).json(reply);
}

async function findByReportId(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const replies = await reportReplies.findByReportId(id);
  res.status(200).json(replies);
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
  findByReportId: asyncHandler(findByReportId),
  findAll: asyncHandler(findAll),
};

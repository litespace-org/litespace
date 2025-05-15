import { reports } from "@litespace/models";
import { forbidden, notfound } from "@/lib/error";
import { Request, Response } from "express";
import { NextFunction } from "express";
import safeRequest from "express-async-handler";
import {
  boolean,
  dateFilter,
  number,
  pageNumber,
  pageSize,
  string,
  withNamedId,
} from "@/validation/utils";
import { isAdmin, isUser } from "@litespace/utils/user";
import zod from "zod";
import { paginationDefaults } from "@/constants";
import { IReport } from "@litespace/types";
import { upload } from "@/lib/assets";
import { v4 as uuid } from "uuid";

const createReportPayload = zod.object({
  title: string,
  description: string,
  screenshot: string.startsWith("data:image/").optional(),
  log: string.optional(),
});

const updateReportPayload = zod.object({
  resolved: boolean,
});

const findReportsPayload = zod.object({
  ids: zod.array(number).optional(),
  users: zod.array(number).optional(),
  title: string.optional(),
  description: string.optional(),
  screenshot: boolean.optional(),
  log: boolean.optional(),
  resolved: boolean.optional(),
  createdAt: dateFilter.optional(),
  updatedAt: dateFilter.optional(),
  page: zod.optional(pageNumber).default(paginationDefaults.page),
  size: zod.optional(pageSize).default(paginationDefaults.size),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { title, description, screenshot, log }: IReport.CreateApiPayload =
    createReportPayload.parse(req.body);

  const key = uuid();

  const screenshotKey = screenshot
    ? await upload({
        data: Buffer.from(screenshot, "utf8"),
        prefix: "reports/screenshots/",
        key,
      })
    : undefined;

  const logKey = log
    ? await upload({
        data: Buffer.from(log, "utf8"),
        prefix: "reports/logs/",
        key,
      })
    : undefined;

  await reports.create({
    userId: user.id,
    title,
    description,
    screenshot: screenshotKey,
    log: logKey,
  });

  res.sendStatus(200);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const { resolved }: IReport.UpdateApiPayload = updateReportPayload.parse(
    req.body
  );

  const found = await reports.findById(id);
  if (!found) return next(notfound.report());

  await reports.update(id, { resolved });

  res.sendStatus(200);
}

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload: IReport.FindApiPayload = findReportsPayload.parse(req.body);

  const { list, total } = await reports.find(payload);

  const response: IReport.FindApiResponse = { list, total };

  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  update: safeRequest(update),
  find: safeRequest(find),
};

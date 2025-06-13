import { reports } from "@litespace/models";
import { forbidden, largeFileSize, notfound } from "@/lib/error";
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
  id,
} from "@/validation/utils";
import { isAdmin, isUser } from "@litespace/utils/user";
import zod from "zod";
import { paginationDefaults } from "@/constants";
import { IReport } from "@litespace/types";
import {
  exceedsSizeLimit,
  getRequestFile,
  upload,
  withFileUrls,
} from "@/lib/assets";

const createReportPayload = zod.object({
  title: string,
  description: string,
});

const updateReportPayload = zod.object({ id, resolved: boolean });

const findReportsPayload = zod.object({
  ids: zod.array(number).describe("filter by reports ids").optional(),
  users: zod.array(number).describe("filter by users ids").optional(),
  title: string.describe("filter by title").optional(),
  description: string.describe("filter by description").optional(),
  screenshot: boolean
    .describe("filter by screenshot (uploaded or not)")
    .optional(),
  log: boolean.describe("filter by log files (uploaded or not)").optional(),
  resolved: boolean.describe("filter by resolved value").optional(),
  createdAt: dateFilter.describe("filter by creation time").optional(),
  updatedAt: dateFilter.describe("filter by upate time").optional(),
  page: pageNumber.optional().default(paginationDefaults.page),
  size: pageSize.optional().default(paginationDefaults.size),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { title, description }: IReport.CreateApiPayload =
    createReportPayload.parse(req.body);

  // upload the screenshot if exists
  const screenshot = getRequestFile(
    req.files,
    IReport.AssetFileName.Screenshot
  );

  if (screenshot && exceedsSizeLimit(screenshot.size, 8))
    return next(largeFileSize());

  const screenshotKey = screenshot
    ? await upload({ data: screenshot.buffer, type: screenshot.mimetype })
    : undefined;

  // upload the log file if exists
  const log = getRequestFile(req.files, IReport.AssetFileName.Log);
  if (log && exceedsSizeLimit(log.size, 1)) return next(largeFileSize());

  const logKey = log
    ? await upload({ data: log.buffer, type: log.mimetype })
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

  const { id, resolved }: IReport.UpdateApiPayload = updateReportPayload.parse(
    req.body
  );

  const found = await reports.findById(id);
  if (!found) return next(notfound.report());

  await reports.update({ id, resolved });

  res.sendStatus(200);
}

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload: IReport.FindApiPayload = findReportsPayload.parse(req.body);

  const { list, total } = await reports.find({
    ids: payload.ids,
    users: payload.users,
    title: payload.title,
    description: payload.description,
    screenshot: payload.screenshot,
    log: payload.log,
    resolved: payload.resolved,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    page: payload.page,
    size: payload.size,
  });

  const response: IReport.FindApiResponse = {
    list: await withFileUrls(list, ["log", "screenshot"]),
    total,
  };
  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  update: safeRequest(update),
  find: safeRequest(find),
};

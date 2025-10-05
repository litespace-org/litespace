import { forbidden } from "@/lib/error";
import { isAdmin } from "@litespace/utils/user";
import { ISessionEvent } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { ids, pageNumber, pageSize } from "@/validation/utils";
import zod, { ZodSchema } from "zod";
import { sessionEvents } from "@litespace/models";

const findQuery: ZodSchema<ISessionEvent.FindApiQuery> = zod.object({
  userIds: ids.optional(),
  sessionIds: ids.optional(),
  size: pageSize.optional(),
  page: pageNumber.optional(),
});

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const query = findQuery.parse(req.query);
  const response: ISessionEvent.FindApiResponse =
    await sessionEvents.findMeta(query);

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
};

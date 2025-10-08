import { forbidden } from "@/lib/error/api";
import { isAdmin, isTutorManager } from "@litespace/utils/user";
import { ISessionEvent } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { ids, pageNumber, pageSize, sessionId } from "@/validation/utils";
import zod, { ZodSchema } from "zod";
import { sessionEvents } from "@litespace/models";

const findQuery: ZodSchema<ISessionEvent.FindApiQuery> = zod.object({
  userIds: ids.optional(),
  sessionIds: ids.optional(),
  size: pageSize.optional(),
  page: pageNumber.optional(),
});

const findBySessionIdQuery: ZodSchema<ISessionEvent.FindBySessionIdApiQuery> =
  zod.object({
    sessionId: sessionId,
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

async function findBySessionId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isAdmin(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());

  const { sessionId } = findBySessionIdQuery.parse(req.params);

  const events = await sessionEvents.findBySessionId({ sessionId });

  const response: ISessionEvent.FindBySessionIdApiResponse = {
    tutor: { state: "absent", events: events.tutor },
    student: { state: "absent", events: events.student },
  };

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
  findBySessionId: safeRequest(findBySessionId),
};

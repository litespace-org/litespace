import { forbidden } from "@/lib/error";
import {
  ids,
  pageNumber,
  pageSize,
  jsonBoolean,
  dateFilter,
} from "@/validation/utils";
import { introVideos } from "@litespace/models";
import { IIntroVideo } from "@litespace/types";
import {
  isAdmin,
  isRegularTutor,
  isTutor,
  isTutorManager,
} from "@litespace/utils";
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
  const allowed = isAdmin(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const { tutorIds, reviewerIds, approved, createdAt, page, size } =
    findPayload.parse(req.body);

  // only admins and tutor-managers are allowed to pass the tutorIds in the payload
  if (isRegularTutor(user) && tutorIds) return next(forbidden());

  const currentUserId = user.id;

  const main = await introVideos.find({
    tutorIds: isAdmin(user) ? tutorIds : [currentUserId],
    state: approved ? IIntroVideo.State.Approved : undefined,
    reviewerIds,
    createdAt,
    page,
    size,
  });

  // if the user is a tutor-manager, add the intro-videos to-be-reviewed in the response.
  const forReviewers = isTutorManager(user)
    ? await introVideos.find({
        state: approved ? IIntroVideo.State.Approved : undefined,
        reviewerIds: [currentUserId],
        tutorIds,
        createdAt,
        page,
        size,
      })
    : undefined;

  const response: IIntroVideo.FindApiResponse = {
    main,
    forReviewers,
  };

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
};

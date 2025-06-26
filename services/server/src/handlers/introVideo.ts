import {
  INTRO_VIDEO_EXPIRY_MONTHS,
  INTRO_VIDEO_MAX_FILE_SIZE,
  INTRO_VIDEO_MAX_MINUTES,
  INTRO_VIDEO_MIN_MINUTES,
} from "@/constants";
import { exceedsSizeLimit, getRequestFile, upload } from "@/lib/assets";
import {
  bad,
  forbidden,
  largeFileSize,
  unexpected,
  exists,
  notfound,
  unauthenticated,
  inActiveTutorManager,
} from "@/lib/error";
import { canReview, canUpdate, chooseReviewer } from "@/lib/introVideo";
import { introVideos } from "@litespace/models";
import { IIntroVideo } from "@litespace/types";
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";
import { first } from "lodash";
import {
  id,
  number,
  withNamedId,
  ids,
  pageNumber,
  pageSize,
  jsonBoolean,
  dateFilter,
} from "@/validation/utils";
import {
  isAdmin,
  isUser,
  isRegularTutor,
  isTutor,
  isTutorManager,
} from "@litespace/utils";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";

const createPayload: zod.ZodSchema<IIntroVideo.CreateApiPayload> = zod.object({
  duration: number,
});

const updatePayload: zod.ZodSchema<IIntroVideo.UpdateApiPayload> = zod.object({
  state: zod.nativeEnum(IIntroVideo.State).optional(),
  reviewerId: id.optional(),
});

const findPayload: ZodSchema<IIntroVideo.FindApiPayload> = zod.object({
  tutorIds: zod.optional(ids),
  reviewerIds: zod.optional(ids),
  approved: zod.optional(jsonBoolean),
  createdAt: zod.optional(dateFilter),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const payload = createPayload.parse(req.body);

  if (
    payload.duration < INTRO_VIDEO_MIN_MINUTES ||
    payload.duration > INTRO_VIDEO_MAX_MINUTES
  )
    return next(bad());

  const { list: prevVideos } = await introVideos.find({
    tutorIds: [user.id],
  });
  const lastVideo = first(prevVideos);

  if (lastVideo && lastVideo?.state !== IIntroVideo.State.Rejected)
    return next(exists.introVideo());

  if (
    lastVideo &&
    dayjs.utc().diff(lastVideo?.createdAt, "months") < INTRO_VIDEO_EXPIRY_MONTHS
  )
    return next(forbidden());

  const video = getRequestFile(req.files, IIntroVideo.AssetFileName.Video);
  if (!video) return next(bad());

  if (exceedsSizeLimit(video.size, INTRO_VIDEO_MAX_FILE_SIZE))
    return next(largeFileSize());

  const reviewerId = await chooseReviewer(lastVideo?.reviewerId || undefined);
  // should always find a reviewer
  if (!reviewerId) return next(unexpected());

  const src = await upload({ data: video.buffer, type: video.mimetype });
  await introVideos.create({
    src,
    reviewerId,
    tutorId: user.id,
  });

  // @TODO: notify the reviewer of this video

  res.sendStatus(200);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id: videoId } = withNamedId("id").parse(req.params);
  if (!videoId) return next(bad());

  const video = await introVideos.findById(videoId);
  if (!video) return next(notfound.introVideo());

  const user = req.user;
  if (!isUser(user)) return next(unauthenticated());

  const payload = updatePayload.parse(req.body);
  const allowed = canUpdate({ user, video, payload });
  if (!allowed) return next(forbidden());

  const isActiveReviewer = await canReview(payload.reviewerId);

  if (!isActiveReviewer && payload.reviewerId)
    return next(inActiveTutorManager());

  // if we need to change the reviewer then put the video in the pending state
  const changedState =
    payload.reviewerId && isActiveReviewer
      ? IIntroVideo.State.Pending
      : payload.state;

  await introVideos.update({
    id: videoId,
    state: changedState,
    reviewerId: isActiveReviewer ? payload.reviewerId : undefined,
  });

  res.sendStatus(200);
}

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
  create: safeRequest(create),
  update: safeRequest(update),
};

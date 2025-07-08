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
import { id, number, withNamedId } from "@/validation/utils";
import { introVideos } from "@litespace/models";
import { IIntroVideo } from "@litespace/types";
import { isRegularTutor, isUser } from "@litespace/utils/user";
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { first } from "lodash";
import zod from "zod";

const createPayload: zod.ZodSchema<IIntroVideo.CreateApiPayload> = zod.object({
  duration: number,
});

const updatePayload: zod.ZodSchema<IIntroVideo.UpdateApiPayload> = zod.object({
  state: zod.nativeEnum(IIntroVideo.State).optional(),
  reviewerId: id.optional(),
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

export default {
  create: safeRequest(create),
  update: safeRequest(update),
};

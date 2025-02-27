import zod from "zod";
import safeRequest from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import { ApiError, IAsset, IUser } from "@litespace/types";
import { isStudent, isStudio, isUser } from "@litespace/auth";

import { apierror, bad, forbidden } from "@/lib/error";
import { drop, getRequestFile, upload } from "@/lib/assets";
import { tutors, users } from "@litespace/models";
import { id } from "@/validation/utils";
import { isStudentOrTutorOrManager } from "@litespace/auth/dist/authorization";

const updateAssetPayload = zod.object({
  id: zod.optional(zod.string()),
  ownerId: id, // the owner of the asset
  type: zod.nativeEnum(IAsset.AssetType),
});

const dropAssetPayload = zod.object({
  id: zod.string(),
  ownerId: id, // the owner of the asset
});

async function uploadAsset(req: Request, res: Response, next: NextFunction) {
  const user = req.user as IUser.Self;
  const payload: IAsset.uploadPayload = updateAssetPayload.parse(req.body);

  // ensure that the request is valid
  if (isStudent(user) && payload.type === "video") return next(bad());
  const file = getRequestFile(req.files, payload.type);
  if (!file) return next(bad());

  // ensure that the request is not forbidden
  if (!isUser(user)) return next(forbidden());
  const dbTutor = await tutors.findById(payload.ownerId);
  if (dbTutor && isStudio(user) && dbTutor?.studioId !== user.id)
    return next(forbidden());
  if (isStudentOrTutorOrManager(user) && payload.ownerId !== user.id)
    return next(forbidden());

  // is the claimed owner is actually the owner?
  if (payload.id) {
    const dbUser = dbTutor || (await users.findById(payload.ownerId));
    if (
      dbUser?.image !== payload.id &&
      dbTutor?.video !== payload.id &&
      dbTutor?.thumbnail !== payload.id
    )
      return next(forbidden());
  }

  // perform the request
  if (payload.id) await drop(payload.id);
  const assetId = await upload({
    // NOTE: id and name are interchangeable
    name: payload.id,
    data: file.buffer,
    type: file.mimetype,
  });

  if (typeof assetId !== "string")
    return next(
      apierror(ApiError.UploadingAssetFailed, assetId.httpStatusCode || 500)
    );

  // insert asset id in the database in case it's new
  if (!payload.id) {
    if (payload.type === "photo")
      await users.update(payload.ownerId, { image: assetId });
    else if (payload.type === "thumbnail")
      await tutors.update(payload.ownerId, { thumbnail: assetId });
    else if (payload.type === "video")
      await tutors.update(payload.ownerId, { video: assetId });
  }

  res.sendStatus(200);
}

async function dropAsset(req: Request, res: Response, next: NextFunction) {
  const user = req.user as IUser.Self;
  const payload: IAsset.dropPayload = dropAssetPayload.parse(req.body);

  if (!isUser(user)) return next(forbidden());
  const dbTutor = await tutors.findById(payload.ownerId);
  if (dbTutor && isStudio(user) && dbTutor?.studioId !== user.id)
    return next(forbidden());
  if (isStudentOrTutorOrManager(user) && payload.ownerId !== user.id)
    return next(forbidden());

  // is the claimed owner is actually the owner?
  const dbUser = dbTutor || (await users.findById(payload.ownerId));
  const [isImage, isVideo, isThumbnail] = [
    dbUser?.image !== payload.id,
    dbTutor?.video !== payload.id,
    dbTutor?.thumbnail !== payload.id,
  ];
  if (!isImage && !isVideo && !isThumbnail) return next(forbidden());

  const assetId = await drop(payload.id);

  if (typeof assetId !== "string")
    return next(
      apierror(ApiError.DroppingAssetFailed, assetId.httpStatusCode || 500)
    );

  // remove asset id from the database
  if (isImage) await users.update(payload.ownerId, { image: null });
  else if (isVideo) await tutors.update(payload.ownerId, { video: null });
  else if (isThumbnail)
    await tutors.update(payload.ownerId, { thumbnail: null });

  res.sendStatus(200);
}

export default {
  upload: safeRequest(uploadAsset),
  drop: safeRequest(dropAsset),
};

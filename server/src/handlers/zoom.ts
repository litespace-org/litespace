import { tutors } from "@/models";
import { IUser } from "@litespace/types";
import { forbidden } from "@/lib/error";
import {
  generateUserBasedAccessToken,
  getZoomUserApp,
} from "@/integrations/zoom/authorization";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

async function setZoomRefreshToken(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const { code } = schema.http.zoom.setRefreshToken.body.parse(req.body);

  if (req.user.type !== IUser.Type.Tutor) return next(forbidden);
  const tokens = await generateUserBasedAccessToken(code, getZoomUserApp());
  const now = new Date().toUTCString();
  await tutors.markTutorWithAuthorizedZoomApp(req.user.id, tokens.refresh, now);
  res.status(200).send();
}

export default {
  setZoomRefreshToken: asyncHandler(setZoomRefreshToken),
};

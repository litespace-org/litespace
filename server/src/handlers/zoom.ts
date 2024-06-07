import { Request, Response } from "@/types/http";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

async function setZoomRefreshToken(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {}

export default {
  setZoomRefreshToken: asyncHandler(setZoomRefreshToken),
};

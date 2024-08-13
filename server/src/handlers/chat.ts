import { messages } from "@/models";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { identityObject } from "@/validation/utils";

async function findRoomMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // todo: add access control and filter
  const { id } = identityObject.parse(req.params);
  const list = await messages.findRoomMessages(id);
  res.status(200).json(list);
}

export default {
  findRoomMessages: asyncHandler(findRoomMessages),
};

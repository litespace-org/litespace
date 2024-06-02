import ResponseError, { forbidden, roomExists } from "@/lib/error";
import { User, rooms } from "@/models";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request.Default, res: Response, next: NextFunction) {
  const { tutorId } = schema.http.chat.create.body.parse(req.body);
  const studentId = req.user.id;

  const exists = await rooms.findByMembers({ studentId, tutorId });
  if (exists) return next(roomExists);

  const id = await rooms.create({ tutorId, studentId });
  res.status(201).json({ id });
}

async function findByUserId(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const userId = req.user.id;
  const userType = req.user.type;

  if (![User.Type.Student, User.Type.Tutor].includes(userType))
    return next(forbidden);

  const list = await rooms.findMemberRooms({
    userId: userId,
    type: userType,
  });

  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  findByUserId: asyncHandler(findByUserId),
};

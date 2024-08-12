import { forbidden, roomExists } from "@/lib/error";
import { rooms } from "@/models";
import { IUser } from "@litespace/types";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request, res: Response, next: NextFunction) {
  const { tutorId } = schema.http.chat.create.body.parse(req.body);
  const studentId = req.user.id;

  const exists = await rooms.findByMembers({ studentId, tutorId });
  if (exists) return next(roomExists());

  const id = await rooms.create({ tutorId, studentId });
  res.status(201).json({ id });
}

async function findByUserId(req: Request, res: Response, next: NextFunction) {
  const id = req.user.id;
  const role = req.user.role;

  if (![IUser.Role.Student, IUser.Role.Tutor].includes(role))
    return next(forbidden());

  const list = await rooms.findMemberRooms({
    userId: id,
    role,
  });

  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  findByUserId: asyncHandler(findByUserId),
};

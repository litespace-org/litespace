import { messages, rooms } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { groupBy } from "lodash";
import zod from "zod";
import { id } from "@/validation/utils";
import { badRequest } from "@/lib/error";

const createRoomPayload = zod.object({ userId: id });

async function createRoom(req: Request, res: Response, next: NextFunction) {
  const { userId } = createRoomPayload.parse(req.params);
  const members = [userId, req.user.id];

  const exists = await rooms.findRoomByMembers(members);
  if (exists) return next(badRequest());

  const roomId = await rooms.create(members);
  res.status(200).json({ roomId });
}

async function findUserRooms(req: Request, res: Response) {
  const { userId } = zod.object({ userId: id }).parse(req.params);
  const userRooms = await rooms.findMemberRooms(userId);
  const members = await rooms.findRoomMembers(userRooms);
  const grouped = groupBy(members, "roomId");
  res.status(200).json(grouped);
}

async function findRoomMessages(req: Request, res: Response) {
  // todo: add access control and filter
  const { roomId } = zod.object({ roomId: id }).parse(req.params);
  const list = await messages.findRoomMessages(roomId);
  res.status(200).json(list);
}

export default {
  createRoom: asyncHandler(createRoom),
  findRoomMessages: asyncHandler(findRoomMessages),
  findUserRooms: asyncHandler(findUserRooms),
};

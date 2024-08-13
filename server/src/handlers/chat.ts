import { messages, rooms } from "@/models";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { groupBy } from "lodash";
import zod from "zod";
import { id } from "@/validation/utils";

async function findUserRooms(req: Request, res: Response) {
  const { userId } = zod.object({ userId: id }).parse(req.params);
  const userRooms = await rooms.findMemberRooms(userId);
  const members = await rooms.findRoomMembers(userRooms);
  const grouped = groupBy(members, "roomId");
  console.log({ userRooms, members, grouped });
  res.status(200).json(grouped);
}

async function findRoomMessages(req: Request, res: Response) {
  // todo: add access control and filter
  const { roomId } = zod.object({ roomId: id }).parse(req.params);
  const list = await messages.findRoomMessages(roomId);
  res.status(200).json(list);
}

export default {
  findRoomMessages: asyncHandler(findRoomMessages),
  findUserRooms: asyncHandler(findUserRooms),
};

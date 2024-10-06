import { calls, messages, rooms } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import safe from "express-async-handler";
import { isEmpty } from "lodash";
import zod from "zod";
import { id, pagination, withNamedId } from "@/validation/utils";
import { badRequest, forbidden, notfound } from "@/lib/error";
import { authorizer } from "@litespace/auth";
import { IMessage, IRoom } from "@litespace/types";

const createRoomPayload = zod.object({ userId: id });
const findRoomByMembersPayload = zod.object({ members: zod.array(id) });

async function createRoom(req: Request, res: Response, next: NextFunction) {
  const { userId } = createRoomPayload.parse(req.params);
  const members = [userId, req.user.id];

  const exists = await rooms.findRoomByMembers(members);
  if (exists) return next(badRequest());

  const roomId = await rooms.create(members);
  res.status(200).json({ roomId });
}

async function findUserRooms(req: Request, res: Response) {
  const { userId } = withNamedId("userId").parse(req.params);
  const query = pagination.parse(req.query);
  const { list: userRooms, total } = await rooms.findMemberRooms({
    pagination: query,
    userId,
  });
  const members = await rooms.findRoomMembers({
    roomIds: userRooms,
    excludeUsers: [userId],
  });

  // group room members while maintaining the order.
  const grouped: IRoom.PopulatedMember[][] = [];
  for (const room of userRooms) {
    const roomMembers = members.filter((member) => member.roomId === room);
    if (isEmpty(roomMembers)) continue;
    grouped.push(roomMembers);
  }

  const response: IRoom.FindUserRoomsApiResponse = { list: grouped, total };
  res.status(200).json(response);
}

async function findRoomMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { roomId }: { roomId: number } = withNamedId("roomId").parse(
    req.params
  );
  const members = await rooms.findRoomMembers({ roomIds: [roomId] });
  if (isEmpty(members)) return next(notfound.base());

  const ids = members.map((member) => member.id);
  const allowed = authorizer()
    .admin()
    .member(...ids)
    .check(req.user);
  if (!allowed) return next(forbidden());

  const { page, size } = pagination.parse(req.query);
  const list: IMessage.FindRoomMessagesApiResponse =
    await messages.findRoomMessages({ room: roomId, page, size });
  res.status(200).json(list);
}

// todo: add auth
async function findRoomByMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { members } = findRoomByMembersPayload.parse(req.query);
  const room = await rooms.findRoomByMembers(members);
  if (!room) return next(notfound.base());
  res.status(200).json({ room });
}

async function findCallRoom(req: Request, res: Response, next: NextFunction) {
  const allowed = authorizer()
    .admin()
    .tutor()
    .student()
    .interviewer()
    .check(req.user);
  if (!allowed) return next(forbidden());

  const { call } = withNamedId("call").parse(req.params);
  const userCall = await calls.findById(call);
  if (!userCall) return next(notfound.base());

  const callMembers = await calls.findCallMembers([userCall.id]);
  if (isEmpty(callMembers)) return next(notfound.base());

  const memberIds = callMembers.map((member) => member.userId);
  const room = await rooms.findRoomByMembers(memberIds);
  if (!room) return next(notfound.base());

  const roomMembers = await rooms.findRoomMembers({ roomIds: [room] });
  if (isEmpty(roomMembers)) return next(notfound.base());

  const response: IRoom.FindCallRoomApiResponse = {
    room,
    members: roomMembers,
  } as const;

  res.status(200).json(response);
}

// todo: add auth
async function findRoomMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { roomId } = withNamedId("roomId").parse(req.params);
  const members = await rooms.findRoomMembers({
    roomIds: [roomId],
    excludeUsers: [req.user.id],
  });
  if (isEmpty(members)) return next(notfound.base());
  res.status(200).json(members);
}

export default {
  createRoom: safe(createRoom),
  findRoomMessages: safe(findRoomMessages),
  findUserRooms: safe(findUserRooms),
  findRoomByMembers: safe(findRoomByMembers),
  findRoomMembers: safe(findRoomMembers),
  findCallRoom: safe(findCallRoom),
};

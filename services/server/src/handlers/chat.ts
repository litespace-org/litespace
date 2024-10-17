import { calls, messages, rooms, users } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import safe from "express-async-handler";
import { isEmpty } from "lodash";
import zod from "zod";
import { id, pagination, withNamedId } from "@/validation/utils";
import { badRequest, forbidden, notfound } from "@/lib/error";
import {
  authorizer,
  isAdmin,
  isInterviewer,
  isStudent,
  isTutor,
  isUser,
} from "@litespace/auth";
import { IMessage, IRoom } from "@litespace/types";

const createRoomPayload = zod.object({ userId: id });
const findRoomByMembersPayload = zod.object({ members: zod.array(id) });

async function createRoom(req: Request, res: Response, next: NextFunction) {
  const currentUser = req.user;
  const allowed = isUser(currentUser);
  if (!allowed) return next(forbidden());

  const { userId: targetUserId } = createRoomPayload.parse(req.params);
  const targetUser = await users.findById(targetUserId);
  if (!targetUser) return next(notfound.user());

  /**
   * Rules:
   * - Students can create rooms with tutors but not the opposite.
   * - Tutors and interviewers can create rooms with each others (no restrictions)
   * - Tutors/interviewers/students cannot create rooms to talk to each others
   *    e.g., tutor cannot have a room with another tutor.
   */
  const eligible =
    (isStudent(currentUser) && isTutor(targetUser)) ||
    (isTutor(currentUser) && isInterviewer(targetUser)) ||
    (isInterviewer(currentUser) && isTutor(targetUser));

  if (!eligible) return next(forbidden());

  const members = [targetUserId, currentUser.id];
  const exists = await rooms.findRoomByMembers(members);
  if (exists) return next(badRequest());

  const roomId = await rooms.create(members);
  res.status(200).json({ roomId });
}

async function findUserRooms(req: Request, res: Response, next: NextFunction) {
  const { userId } = withNamedId("userId").parse(req.params);
  const user = req.user;
  const owner = isUser(user) && user.id === userId;
  const allowed = owner || isAdmin(user);
  if (!allowed) return next(forbidden());

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
  const { roomId } = withNamedId("roomId").parse(req.params);
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

async function findRoomByMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const { members } = findRoomByMembersPayload.parse(req.query);
  const allowed = (isUser(user) && members.includes(user.id)) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const room = await rooms.findRoomByMembers(members);
  if (!room) return next(notfound.base());
  res.status(200).json({ room });
}

/**
 *  @deprecated You can find room by members
 */
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

async function findRoomMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { roomId } = withNamedId("roomId").parse(req.params);
  const members = await rooms.findRoomMembers({
    roomIds: [roomId],
    excludeUsers: [user.id],
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

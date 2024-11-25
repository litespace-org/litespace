import { calls, messages, rooms, users } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { isEmpty } from "lodash";
import zod from "zod";
import {
  id,
  pagination,
  withNamedId,
  pageNumber,
  jsonBoolean,
  pageSize,
} from "@/validation/utils";
import { empty, exists, forbidden, notfound } from "@/lib/error";
import {
  authorizer,
  isAdmin,
  isGhost,
  isInterviewer,
  isStudent,
  isTutor,
  isUser,
} from "@litespace/auth";
import { IMessage, IRoom } from "@litespace/types";
import { buildRoomObject, fetchLatestMessage } from "@/lib/chat";

const createRoomPayload = zod.object({ userId: id });
const findRoomByMembersPayload = zod.object({ members: zod.array(id) });
const findUserRoomsQuery = zod.object({
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
  pinned: zod.optional(jsonBoolean),
  muted: zod.optional(jsonBoolean),
  keyword: zod.optional(zod.string()),
});

const updateRoomPayload = zod.object({
  pinned: zod.optional(zod.boolean()),
  muted: zod.optional(zod.boolean()),
});

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
  const room = await rooms.findRoomByMembers(members);
  if (room) return next(exists.room());

  const roomId = await rooms.create(members);
  res.status(200).json({ roomId });
}

async function findUserRooms(req: Request, res: Response, next: NextFunction) {
  const { userId } = withNamedId("userId").parse(req.params);
  const user = req.user;
  const isOwner = isUser(user) && user.id === userId;
  const isAllowed = isOwner || isAdmin(user);
  if (!isAllowed) return next(forbidden());

  const { page, size, pinned, muted, keyword }: IRoom.FindUserRoomsApiQuery =
    findUserRoomsQuery.parse(req.query);

  const { list: userRooms, total } = await rooms.findMemberRooms({
    page,
    size,
    pinned,
    muted,
    userId,
    keyword,
  });

  const members = await rooms.findRoomMembers({
    roomIds: userRooms,
    excludeUsers: [userId],
  });

  const responseList = await Promise.all(
    userRooms.map(async (roomId) => {
      const latestMessage = await fetchLatestMessage(roomId);
      const roomMembers = members.filter((member) => member.roomId === roomId);
      return buildRoomObject(roomId, user.id, latestMessage, roomMembers);
    })
  );

  const response: IRoom.FindUserRoomsApiResponse = { list: responseList, total };
  res.status(200).json(response);
}

async function findRoomMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { roomId } = withNamedId("roomId").parse(req.params);
  const members = await rooms.findRoomMembers({ roomIds: [roomId] });
  if (isEmpty(members)) return next(notfound.room());

  const ids = members.map((member) => member.id);
  const member = isUser(user) && ids.includes(user.id);
  const eligible = member || isAdmin(user);
  if (!eligible) return next(forbidden());

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
  if (!room) return next(notfound.room());
  res.status(200).json({ room });
}

/**
 *  @deprecated You can find room by members
 */
async function findCallRoom(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user) || isGhost(user);
  if (!allowed) return next(forbidden());

  const { call } = withNamedId("call").parse(req.params);
  const userCall = await calls.findById(call);
  if (!userCall) return next(notfound.call());

  const callMembers = await calls.findCallMembers([userCall.id]);
  if (isEmpty(callMembers)) return next(notfound.call());

  const memberIds = callMembers.map((member) => member.userId);
  const isMember = isUser(user) && memberIds.includes(user.id);
  const eligible = isMember || isAdmin(user) || isGhost(user);
  if (!eligible) return next(forbidden());

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
  if (isEmpty(members)) return next(notfound.room());
  res.status(200).json(members);
}

async function updateRoom(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const eligable = isUser(user);
  if (!eligable) return next(forbidden());

  const { roomId } = withNamedId("roomId").parse(req.params);
  const room = await rooms.findById(roomId);
  if (!room) return next(notfound.room());

  const members = await rooms.findRoomMembers({ roomIds: [roomId] });
  const member =
    isUser(user) && members.find((member) => member.id === user.id);
  if (!member) return next(forbidden());

  const payload: IRoom.UpdateRoomPayload = updateRoomPayload.parse(req.body);
  if (payload.muted === undefined && payload.pinned === undefined)
    return next(empty());

  const updatedMember = await rooms.update({
    userId: user.id,
    roomId,
    payload,
  });

  res.status(200).json(updatedMember);
}

export default {
  createRoom: safeRequest(createRoom),
  findRoomMessages: safeRequest(findRoomMessages),
  findUserRooms: safeRequest(findUserRooms),
  findRoomByMembers: safeRequest(findRoomByMembers),
  findRoomMembers: safeRequest(findRoomMembers),
  findCallRoom: safeRequest(findCallRoom),
  updateRoom: safeRequest(updateRoom),
};

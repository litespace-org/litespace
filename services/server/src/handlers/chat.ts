import { knex, messages, rooms, users } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { isEmpty } from "lodash";
import zod, { ZodSchema } from "zod";
import {
  id,
  pagination,
  withNamedId,
  pageNumber,
  jsonBoolean,
  pageSize,
} from "@/validation/utils";
import {
  empty,
  exists,
  forbidden,
  notfound,
  notRoomMember,
} from "@/lib/error/api";
import {
  isAdmin,
  isTutorManager,
  isStudent,
  isTutor,
  isUser,
} from "@litespace/utils/user";
import { IMessage, IRoom } from "@litespace/types";
import { asFindUserRoomsApiRecord } from "@/lib/chat";
import { cache } from "@/lib/cache";
import { withImageUrls } from "@/lib/user";

const createRoomPayload: ZodSchema<IRoom.CreateRoomApiPayload> = zod.object({
  userId: id,
  message: zod.optional(zod.string()),
});

const findRoomByMembersPayload: ZodSchema<IRoom.FindRoomByMembersApiPayload> =
  zod.object({
    members: zod.array(id),
  });

const findUserRoomsQuery: ZodSchema<IRoom.FindUserRoomsApiQuery> = zod.object({
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
  pinned: zod.optional(jsonBoolean),
  muted: zod.optional(jsonBoolean),
  keyword: zod.optional(zod.string()),
});

const updateRoomPayload: ZodSchema<IRoom.UpdateRoomApiPayload> = zod.object({
  pinned: zod.optional(zod.boolean()),
  muted: zod.optional(zod.boolean()),
});

async function createRoom(req: Request, res: Response, next: NextFunction) {
  const currentUser = req.user;
  const allowed = isUser(currentUser);
  if (!allowed) return next(forbidden());

  const { userId: targetUserId, message } = createRoomPayload.parse(req.body);
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
    (isTutor(currentUser) && isTutorManager(targetUser)) ||
    (isTutorManager(currentUser) && isTutor(targetUser));

  if (!eligible) return next(forbidden());

  const members = [targetUserId, currentUser.id];
  const room = await rooms.findRoomByMembers(members);
  if (room) return next(exists.room());

  const roomId = await knex.transaction(async (tx) => {
    const roomId = await rooms.create(members, tx);
    if (message)
      await messages.create(
        {
          roomId,
          userId: currentUser.id,
          text: message,
        },
        tx
      );
    return roomId;
  });

  const response: IRoom.CreateRoomApiResponse = { roomId };
  res.status(200).json(response);
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

  // members of all rooms
  const members = await rooms.findRoomMembers({ roomIds: userRooms });
  const onlineStatuses = await cache.onlineStatus.isOnlineBatch(
    members.map((m) => m.id)
  );

  // todo: optimize find user rooms query
  const list = await Promise.all(
    userRooms.map(async (roomId) => {
      const latestMessage = await messages.findLatestRoomMessage({
        room: roomId,
      });

      // members of this specific room
      const roomMembers = await withImageUrls(
        members.filter((member) => member.roomId === roomId)
      );
      const currentMember = roomMembers.find((member) => member.id === userId);
      const otherMember = roomMembers.find((member) => member.id !== userId);

      const unreadMessagesCount = otherMember
        ? await messages.findUnreadCount({
            user: otherMember.id,
            room: roomId,
          })
        : 0;

      if (!currentMember || !otherMember)
        throw Error("unreachable; should never happen.");

      const otherMemberOnlineStatus =
        onlineStatuses.get(otherMember.id) || false;

      return asFindUserRoomsApiRecord({
        roomId,
        latestMessage,
        unreadMessagesCount,
        currentMember,
        otherMember,
        otherMemberOnlineStatus,
      });
    })
  );

  const response: IRoom.FindUserRoomsApiResponse = { list, total };
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
    excludeUsers: [],
  });

  if (isEmpty(members)) return next(notfound.room());

  const isUserMember = members.find((member) => member.id === user.id);
  if (!isUserMember) return next(notRoomMember());

  const statusMap = await cache.onlineStatus.isOnlineBatch(
    members.map((member) => member.id)
  );

  const withStatus = members.map((member) => ({
    ...member,
    online: !!statusMap.get(member.id),
  }));

  const response: IRoom.FindRoomMembersApiResponse =
    await withImageUrls(withStatus);

  res.status(200).json(response);
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

  const response: IRoom.UpdateRoomApiResponse = updatedMember;
  res.status(200).json(response);
}

export default {
  createRoom: safeRequest(createRoom),
  findRoomMessages: safeRequest(findRoomMessages),
  findUserRooms: safeRequest(findUserRooms),
  findRoomByMembers: safeRequest(findRoomByMembers),
  findRoomMembers: safeRequest(findRoomMembers),
  updateRoom: safeRequest(updateRoom),
};

import { cache } from "@/lib/cache";
import { bad, forbidden } from "@/lib/error/api";
import { canAccessSession } from "@/lib/session";
import { isUser } from "@litespace/utils/user";
import { isSessionId, optional } from "@litespace/utils";
import { ISession } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import {
  AccessToken,
  AudioCodec,
  EncodedFileOutput,
  RoomEgress,
  S3Upload,
  VideoCodec,
} from "livekit-server-sdk";
import { livekitConfig, spaceConfig } from "@/constants";
import { sessionId } from "@/validation/utils";
import zod, { ZodSchema } from "zod";
import { users } from "@litespace/models";
import { livekitRoom } from "@/lib/livekit";

const findSessionMembersParams: ZodSchema<ISession.FindSessionMembersApiParams> =
  zod.object({ sessionId });

const getSessionTokenQuery: ZodSchema<ISession.GetSessionTokenApiQuery> =
  zod.object({ sessionId });

async function findSessionMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { sessionId } = findSessionMembersParams.parse(req.params);
  if (!isSessionId(sessionId)) return next(bad());

  const ok = await canAccessSession({ sessionId, userId: user.id });
  if (!ok) return next(forbidden());

  const memberIds = await cache.session.getMembers(sessionId);
  const { list: members } = memberIds.length
    ? await users.find({ ids: memberIds, full: true })
    : { list: [] };
  const response: ISession.FindSessionMembersApiResponse = members.map(
    (member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      gender: member.gender,
    })
  );

  res.status(200).json(response);
}

async function getSessionToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { sessionId }: ISession.GetSessionTokenApiQuery =
    getSessionTokenQuery.parse(req.query);
  if (!isSessionId(sessionId)) return next(bad());

  const ok = await canAccessSession({ sessionId, userId: user.id });
  if (!ok) return next(forbidden());

  const rooms = await livekitRoom.listRooms();
  const roomCount = rooms.length;
  const exsit = rooms.find((room) => room.sid === sessionId);

  // allow only two concurrent rooms to be recorded.
  const create = !exsit && roomCount < 2;
  if (create)
    await livekitRoom.createRoom({
      name: sessionId,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 2,
      egress: new RoomEgress({
        participant: {
          options: {
            case: "advanced",
            value: {
              width: 192,
              height: 144,
              framerate: 24,
              audioCodec: AudioCodec.OPUS,
              videoCodec: VideoCodec.VP8,
              videoBitrate: 3000,
            },
          },
          fileOutputs: [
            new EncodedFileOutput({
              filepath: "sessions/{room_name}/{publisher_identity}-{time}",
              output: {
                case: "s3",
                value: new S3Upload({
                  accessKey: spaceConfig.accessKeyId,
                  secret: spaceConfig.secretAccessKey,
                  bucket: spaceConfig.bucketName,
                  region: "fra1",
                  forcePathStyle: true,
                  endpoint: "https://fra1.digitaloceanspaces.com",
                }),
              },
            }),
          ],
        },
      }),
    });

  // ref: https://docs.livekit.io/home/get-started/authentication/
  const at = new AccessToken(livekitConfig.apiKey, livekitConfig.apiSecret, {
    identity: user.id.toString(),
    name: optional(user.name),
    ttl: "10m",
  });

  at.addGrant({
    room: sessionId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await at.toJwt();

  const response: ISession.GetSessionTokenApiResponse = { token: jwt };
  res.status(200).json(response);
}

export default {
  findSessionMembers: safeRequest(findSessionMembers),
  getSessionToken: safeRequest(getSessionToken),
};

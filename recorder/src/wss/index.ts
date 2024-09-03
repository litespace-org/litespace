import { serverConfig } from "@/config";
import { Server, Socket } from "socket.io";
import zod from "zod";
import fs from "node:fs";
import { ICall, IUser } from "@litespace/types";
import { calls } from "@litespace/models";
import { asRecordingPath } from "@/lib/call";
import { map } from "lodash";
import dayjs from "@/lib/dayjs";
import "colors";
import { safe } from "@/lib/error";

/// <reference path="@litespace/auth" />

const chunkData = zod.object({
  chunk: zod.instanceof(Buffer),
  call: zod.coerce.number(),
  user: zod.coerce.number(),
});

type Call = {
  call: ICall.Self;
  members: ICall.PopuldatedMember[];
};

class WssHandler {
  user: IUser.Self;
  callMap: Map<number, Call> = new Map();

  constructor(
    private readonly io: Server,
    private readonly socket: Socket
  ) {
    this.user = socket.request.user;
    console.log(`${this.user.id} is connected`.gray);
    this.chunk();
  }

  chunk() {
    this.socket.on("chunk", async (data: unknown) => {
      const result = await safe(async () => {
        const { chunk, call, user } = chunkData.parse(data);
        if (user !== this.user.id) return console.log("Unauthorized".red);

        const userCall = await this.findCall(call, user);
        if (userCall === null) return console.log("Call not found".red);

        const recordable = this.isRecordable(userCall.call);
        if (!recordable) return console.log("Call is not recordable".red);

        if (userCall.call.recordingStatus !== ICall.RecordingStatus.Recording)
          await calls.update([call], {
            recordingStatus: ICall.RecordingStatus.Recording,
          });

        const location = asRecordingPath(call, user);
        console.log(
          `[chunk] Processing: ${location} size: ${chunk.byteLength} bytes`.gray
        );
        if (!fs.existsSync(serverConfig.assets))
          fs.mkdirSync(serverConfig.assets);

        fs.appendFileSync(location, chunk);
      });

      if (result instanceof Error)
        console.log(`Socket error: ${result.message}`);
    });
  }

  async findCall(callId: number, user: number): Promise<Call | null> {
    const cache = this.callMap.get(callId);
    if (cache) return cache;

    const [call, members] = await Promise.all([
      calls.findById(callId),
      calls.findCallMembers([callId]),
    ]);

    if (!call) return null;
    if (!this.isMember(user, members)) return null;
    // cache
    this.callMap.set(call.id, { call, members });
    return { call, members };
  }

  isMember(user: number, members: Call["members"]) {
    return map(members, "userId").includes(user);
  }

  isRecordable(call: ICall.Self) {
    const now = dayjs.utc();
    const start = dayjs.utc(call.start);
    const end = start.add(call.duration, "minutes");
    return (
      now.isBetween(start, end, "seconds", "[]") && call.canceledBy === null
    );
  }

  async clean() {
    setInterval(
      () => {
        const calls = Array.from(this.callMap.values());
        const deletable = calls.filter(({ call }) => !this.isRecordable(call));
        console.log(
          `Will delete ${deletable.length} of ${calls.length} calls `
        );
      },
      1000 * 60 * 60 * 24 // one day
    );
  }
}

export function init(io: Server) {
  io.on("connection", (socket: Socket) => new WssHandler(io, socket));
}

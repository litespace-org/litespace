import { serverConfig } from "@/config";
import path from "node:path";
import { Server, Socket } from "socket.io";
import zod from "zod";
import fs from "node:fs";
import "colors";

const chunkData = zod.object({
  chunk: zod.instanceof(Buffer),
  call: zod.coerce.number(),
  user: zod.coerce.number(),
});

class WssHandler {
  constructor(
    private readonly io: Server,
    private readonly socket: Socket
  ) {
    this.chunk();
  }

  chunk() {
    this.socket.on("chunk", async (data: any) => {
      try {
        const { chunk, call, user } = chunkData.parse(data);
        const filename = `${call}-${user}.mp4`;
        const location = path.join(serverConfig.assets, filename);
        console.log(
          `Processing: ${filename} size: ${chunk.byteLength} bytes`.cyan
        );
        if (!fs.existsSync(serverConfig.assets))
          fs.mkdirSync(serverConfig.assets);

        fs.appendFileSync(location, chunk);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export function init(io: Server) {
  io.on("connection", (socket: Socket) => new WssHandler(io, socket));
}

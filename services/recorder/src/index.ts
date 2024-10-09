import express, { json, urlencoded } from "express";
import cors, { CorsOptions } from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { serverConfig } from "@/config";
import { error } from "@/middlewares/error";
import { init } from "@/wss";
import {
  authorizeSocket,
  onlyForHandshake,
  authenticated,
  authMiddleware,
} from "@litespace/auth";
import "colors";
import { initWorker } from "@/workers";

const corsOptions: CorsOptions = {
  credentials: true,
  origin: [...serverConfig.origin],
};

initWorker("ffmpeg.js");
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOptions, maxHttpBufferSize: 1e10 });

io.engine.use(onlyForHandshake(authMiddleware("jwt_secret")));
io.engine.use(onlyForHandshake(authorizeSocket));

init(io);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(authMiddleware("jwt_secret"));
app.use("/", authenticated, express.static(serverConfig.assets));
app.use(error);

server.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.green)
);

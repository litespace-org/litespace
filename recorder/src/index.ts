import express, { json, urlencoded } from "express";
import cors, { CorsOptions } from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { serverConfig } from "@/config";
import call from "@/routes/call";
import { error } from "@/middlewares/error";
import { init } from "@/wss";
import {
  initSession,
  authorizeSocket,
  initPassport,
  onlyForHandshake,
  authenticated,
} from "@litespace/auth";
import "colors";
import { initWorker } from "@/workers";

const corsOptions: CorsOptions = {
  credentials: true,
  origin: [...serverConfig.origin],
};

// initWorker("ffmpeg.js");
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOptions, maxHttpBufferSize: 1e10 });

const { passport } = initPassport();
const session = initSession({
  secure: false, // should be switched in production
});

io.engine.use(onlyForHandshake(session));
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(onlyForHandshake(authorizeSocket));

init(io);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use("/", authenticated, express.static(serverConfig.assets));
app.use("/api/v1/call", call);
app.use(error);

server.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.green)
);

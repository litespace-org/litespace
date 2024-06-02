import { createServer } from "node:http";
import { Server } from "socket.io";
import express, { json } from "express";
import routes from "@/routes";
import { isProduction, serverConfig } from "@/constants";
import { errorHandler } from "@/middleware/error";
import { authorizedSocket } from "@/middleware/auth";
import { wssHandler } from "@/wss";
import passport from "@/lib/passport";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import connectPostgres from "connect-pg-simple";
import { pool } from "@/models/query";
import "colors";
import { allowCrossDomains } from "@/middleware/domains";

const SessionStore = connectPostgres(session);
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// todo: use dedicated auth middleware for socket.io
io.engine.use(authorizedSocket);
io.on("connection", wssHandler);

app.use(logger("dev"));
// todo: enable back with correct config
// app.use(cors());
app.use(json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(allowCrossDomains);
// https://youtu.be/SBvmnHTQIPY?t=2517
// todos:
// 1. session vs jwt
// 2. use passport for
// 3. add endpoint /api/v1/user/me ==> to get user info (done)
// 4. add apple and discord
// 5. save session (done)
app.use(
  session({
    secret: "keyboard cat", // todo: define constants
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ pool, tableName: "sessons" }),
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: isProduction }, // 30 days
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", routes.authorization);
app.use("/api/v1/user", routes.user);
app.use("/api/v1/slot", routes.slot);
app.use("/api/v1/tutor", routes.tutor);
app.use("/api/v1/student", routes.student);
app.use("/api/v1/zoom", routes.zoom);
app.use("/api/v1/lesson", routes.lesson);
app.use("/api/v1/rating", routes.rating);
app.use("/api/v1/subscription", routes.subscription);
app.use("/api/v1/chat", routes.chat);
app.use(errorHandler);

server.listen(serverConfig.port, serverConfig.host, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);

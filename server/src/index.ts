import { createServer } from "node:http";
import { Server } from "socket.io";
import express, { json } from "express";
import routes from "@/routes";
import { isProduction, serverConfig } from "@/constants";
import { errorHandler } from "@/middleware/error";
import { wssHandler } from "@/wss";
import passport from "@/lib/passport";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import connectPostgres from "connect-pg-simple";
import { pool } from "@/models/query";
import { onlyForHandshake } from "./middleware/common";
import "colors";

const SessionStore = connectPostgres(session);
const sessionMiddleware = session({
  secret: "keyboard cat", // todo: define constants
  resave: false,
  saveUninitialized: false,
  store: new SessionStore({ pool, tableName: "sessons" }),
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: isProduction }, // 30 days
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { credentials: true, origin: [...serverConfig.origin] },
});

// todo: use dedicated auth middleware for socket.io
// io.engine.use(authorizedSocket);
io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(
  onlyForHandshake((req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.writeHead(401);
      res.end();
    }
  })
);
io.on("connection", wssHandler);

app.use(logger("dev"));
// todo: enable back with correct config
app.use(cors({ credentials: true, origin: [...serverConfig.origin] }));
app.use(json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", routes.authorization);
app.use("/api/v1/user", routes.user);
app.use("/api/v1/slot", routes.slot);
app.use("/api/v1/tutor", routes.tutor);
app.use("/api/v1/student", routes.student);
app.use("/api/v1/call", routes.call);
app.use("/api/v1/rating", routes.rating);
app.use("/api/v1/subscription", routes.subscription);
app.use("/api/v1/chat", routes.chat);
app.use("/api/v1/plan", routes.plan);
app.use("/api/v1/coupon", routes.coupon);
app.use("/api/v1/invite", routes.invite);
app.use("/api/v1/report", routes.report);
app.use(errorHandler);

server.listen(serverConfig.port, serverConfig.host, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);

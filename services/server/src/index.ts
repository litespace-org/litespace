import { createServer } from "node:http";
import { Server } from "socket.io";
import express, { json } from "express";
import routes from "@/routes";
import { ghostConfig, jwtSecret, serverConfig } from "@/constants";
import { errorHandler } from "@/middleware/error";
import { wssHandler } from "@/wss";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import { onlyForHandshake } from "@/middleware/util";
import { ApiContext } from "@/types/api";
import { authorizeSocket } from "@litespace/auth";
import { authMiddleware, adminOnly } from "@litespace/auth";
import { isAllowedOrigin } from "@/lib/cors";
import { cache } from "@/lib/cache";
import "colors";

// global error handling
// this is needed to prevent the server process from exit.
process.on("uncaughtException", (error) => {
  console.log("Uncaught exception");
  console.error(error);
  // TODO: notify errors
});

// Stablish connection with the redis cache.
cache.connect().then(() => {
  // Flush the cache as the data in cache might not be compatible with the changes
  // in the server itself which might lead to undefined behavior.
  cache.flush();
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { credentials: true, origin: isAllowedOrigin },
});
const context: ApiContext = { io };

io.engine.use(
  onlyForHandshake(
    authMiddleware({ jwtSecret, ghostPassword: ghostConfig.password })
  )
);
io.engine.use(onlyForHandshake(authorizeSocket));
io.on("connection", wssHandler);

app.use(
  logger(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);
app.use(cors({ credentials: true, origin: isAllowedOrigin }));
app.use(json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(authMiddleware({ jwtSecret, ghostPassword: ghostConfig.password }));
app.use(
  "/assets/uploads",
  express.static(serverConfig.assets.directory.uploads)
);
app.use(
  "/assets/receipts",
  adminOnly,
  express.static(serverConfig.assets.directory.receipts)
);
app.use("/api/v1/auth", routes.auth);
app.use("/api/v1/contact-request", routes.contactRequest);
app.use("/api/v1/user", routes.user(context));
app.use("/api/v1/lesson", routes.lesson(context));
app.use("/api/v1/interview", routes.interview);
app.use("/api/v1/availability-slot", routes.availabilitySlot);
app.use("/api/v1/rating", routes.rating);
app.use("/api/v1/chat", routes.chat);
app.use("/api/v1/plan", routes.plan);
app.use("/api/v1/coupon", routes.coupon);
app.use("/api/v1/invite", routes.invite);
app.use("/api/v1/invoice", routes.invoice(context));
app.use("/api/v1/topic", routes.topic);
app.use("/api/v1/withdraw-method/", routes.withdrawMethod);
app.use("/api/v1/asset", routes.asset);
app.use("/api/v1/cache", routes.cache);
app.use("/api/v1/session", routes.session);
app.use(errorHandler);

server.listen(serverConfig.port, serverConfig.host, () =>
  console.log(
    `Server is running on ${serverConfig.host}:${serverConfig.port}`.cyan
  )
);

import { createServer } from "node:http";
import { Server } from "socket.io";
import express, { json, Request, Response } from "express";
import compression from "compression";
import routes from "@/routes";
import { jwtSecret, serverConfig } from "@/constants";
import { errorHandler } from "@/middleware/error";
import { wssHandler } from "@/wss";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import { onlyForHandshake } from "@/middleware/util";
import { ApiContext } from "@/types/api";
import { authorizeSocket } from "@litespace/auth";
import { authMiddleware } from "@litespace/auth";
import { isAllowedOrigin } from "@/lib/cors";
import { cache } from "@/lib/cache";
import { msg } from "@/lib/telegram";
import "colors";
import { Wss } from "@litespace/types";
import { isAxiosError } from "axios";

// global error handling
// this is needed to prevent the server process from exit.
process.on("uncaughtException", async (error) => {
  console.log("Uncaught exception");
  console.error(error);
  try {
    await msg(
      `uncaught exception: ${error.message}\n${error.stack?.split("\n")}`
    );
  } catch (error) {
    console.log(
      `Faield to notify exception`,
      isAxiosError(error) ? error.response : error
    );
  }
});

// Stablish connection with the redis cache.
cache.connect().then(() => {
  // Flush the cache as the data in cache might not be compatible with the changes
  // in the server itself which might lead to undefined behavior.
  cache.flush();
});

const app = express();
const server = createServer(app);
const io = new Server<Wss.ClientEventsMap, Wss.ServerEventsMap>(server, {
  pingTimeout: 60_000,
  cors: { credentials: true, origin: isAllowedOrigin },
});
const context: ApiContext = { io };

io.engine.use(onlyForHandshake(authMiddleware({ jwtSecret })));
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

app.use(
  compression({
    filter: function (req: Request, res: Response) {
      if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false;
      }

      // fallback to standard filter function
      return compression.filter(req, res);
    },
  })
);

app.use(cors({ credentials: true, origin: isAllowedOrigin }));
app.use(json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(authMiddleware({ jwtSecret }));
app.use("/api/v1/auth", routes.auth);
app.use("/api/v1/contact-request", routes.contactRequest);
app.use("/api/v1/user", routes.user(context));
app.use("/api/v1/student", routes.student);
app.use("/api/v1/lesson", routes.lesson(context));
app.use("/api/v1/interview", routes.interview);
app.use("/api/v1/availability-slot", routes.availabilitySlot);
app.use("/api/v1/rating", routes.rating);
app.use("/api/v1/chat", routes.chat);
app.use("/api/v1/plan", routes.plan);
app.use("/api/v1/plan-invite", routes.planInvites);
app.use("/api/v1/coupon", routes.coupon);
app.use("/api/v1/invite", routes.invite);
app.use("/api/v1/invoice", routes.invoice(context));
app.use("/api/v1/topic", routes.topic);
app.use("/api/v1/asset", routes.asset);
app.use("/api/v1/cache", routes.cache);
app.use("/api/v1/asset", routes.asset);
app.use("/api/v1/session", routes.session);
app.use("/api/v1/fawry", routes.fawry(context));
app.use("/api/v1/tx", routes.transaction);
app.use("/api/v1/sub", routes.subscription);
app.use("/api/v1/confirmation-code", routes.confirmationCode);
app.use("/api/v1/report", routes.report);
app.use("/api/v1/demo-session", routes.demoSession);
app.use("/api/v1/intro-video", routes.introVideo);
app.use("/api/v1/paymob", routes.paymob);
app.use("/api/v1/time", routes.time);

app.use(errorHandler);

server.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);

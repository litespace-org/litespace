import { createServer } from "node:http";
import { Server } from "socket.io";
import express, { json } from "express";
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
import { ApiRoutesManager } from "@litespace/utils/routes";

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

const apiRoutes = new ApiRoutesManager();

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
app.use(authMiddleware({ jwtSecret }));
app.use(
  apiRoutes.generateUrl({
    route: {
      base: "auth",
    },
    type: "base",
  }),
  routes.auth
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "contactRequest",
    },
    type: "base",
  }),
  routes.contactRequest
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "user",
    },
    type: "base",
  }),
  routes.user(context)
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "lesson",
    },
    type: "base",
  }),
  routes.lesson(context)
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "interview",
    },
    type: "base",
  }),
  routes.interview
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "availabilitySlot",
    },
    type: "base",
  }),
  routes.availabilitySlot
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "rating",
    },
    type: "base",
  }),
  routes.rating
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "chat",
    },
    type: "base",
  }),
  routes.chat
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "plan",
    },
    type: "base",
  }),
  routes.plan
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "coupon",
    },
    type: "base",
  }),
  routes.coupon
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "invite",
    },
    type: "base",
  }),
  routes.invite
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "invoice",
    },
    type: "base",
  }),
  routes.invoice(context)
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "topic",
    },
    type: "base",
  }),
  routes.topic
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "asset",
    },
    type: "base",
  }),
  routes.asset
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "cache",
    },
    type: "base",
  }),
  routes.cache
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "session",
    },
    type: "base",
  }),
  routes.session
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "fawry",
    },
    type: "base",
  }),
  routes.fawry(context)
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "transaction",
    },
    type: "base",
  }),
  routes.transaction
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "subscription",
    },
    type: "base",
  }),
  routes.subscription
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "confirmationCode",
    },
    type: "base",
  }),
  routes.confirmationCode
);

app.use(
  apiRoutes.generateUrl({
    route: {
      base: "report",
    },
    type: "base",
  }),
  routes.report
);

app.use(errorHandler);

server.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);

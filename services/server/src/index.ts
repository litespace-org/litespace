import { createServer } from "node:http";
import { Server } from "socket.io";
import express, { json } from "express";
import routes from "@/routes";
import { serverConfig } from "@/constants";
import { errorHandler } from "@/middleware/error";
import { wssHandler } from "@/wss";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import { onlyForHandshake } from "@/middleware/common";
import { capitalize } from "lodash";
import { client } from "@/redis/client";
import { ApiContext } from "@/types/api";
import { safe } from "@litespace/sol";
import { authorizeSocket } from "@litespace/auth";
import { authMiddleware, router as authRouter } from "@litespace/auth";
import { isAllowedOrigin } from "@/lib/cors";
import "colors";

// connect to the redis server
safe(async () => client.connect());

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { credentials: true, origin: isAllowedOrigin },
});
const context: ApiContext = { io };

io.engine.use(onlyForHandshake(authMiddleware("jwt_secret")));
io.engine.use(onlyForHandshake(authorizeSocket));
io.on("connection", wssHandler);

app.use(
  logger(function (tokens, req, res) {
    const role = req.user?.role || "unauthorized";
    return [
      capitalize(role),
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
app.use(authMiddleware("jwt_secret"));
app.use("/assets/", express.static(serverConfig.media.directory));
app.use("/api/v1/auth", authRouter("jwt_secret"));
app.use("/api/v1/user", routes.user(context));
app.use("/api/v1/rule", routes.rule);
app.use("/api/v1/tutor", routes.tutor);
app.use("/api/v1/student", routes.student);
app.use("/api/v1/call", routes.call);
app.use("/api/v1/lesson", routes.lesson(context));
app.use("/api/v1/interview", routes.interview);
app.use("/api/v1/rating", routes.rating);
app.use("/api/v1/subscription", routes.subscription);
app.use("/api/v1/chat", routes.chat);
app.use("/api/v1/plan", routes.plan);
app.use("/api/v1/coupon", routes.coupon);
app.use("/api/v1/invite", routes.invite);
app.use("/api/v1/report", routes.report);
app.use("/api/v1/report/reply", routes.reportReply);
app.use("/api/v1/invoice", routes.invoice(context));
app.use("/api/v1/withdraw-method/", routes.withdrawMethod);
app.use("/api/v1/asset", routes.asset);
app.use(errorHandler);

server.listen(serverConfig.port, serverConfig.host, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);

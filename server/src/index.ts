import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import express, { json } from "express";
import routes from "@/routes";
import { isDev, serverConfig } from "@/constants";
import { errorHandler } from "@/middleware/error";
import cors from "cors";
import "colors";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket: Socket) => {
  if (isDev) console.log("A connection is made.".yellow);

  socket.on("disconnect", () => {
    if (isDev) console.log("Client disconnected".yellow);
  });
});

app.use(cors());
app.use(json());
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

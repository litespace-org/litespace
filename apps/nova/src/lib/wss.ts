import { sockets as urls } from "@litespace/atlas";
import { io } from "socket.io-client";
import { backend } from "@/lib/atlas";

const server = io(urls.main[backend], {
  autoConnect: true,
  withCredentials: true,
});

const recorder = io(urls.recorder[backend], {
  autoConnect: true,
  withCredentials: true,
});

export const sockets = { server, recorder };

export default server;

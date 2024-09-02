import { sockets } from "@litespace/atlas";
import { io } from "socket.io-client";
import { backend } from "@/lib/atlas";

const socket = io(sockets.backend[backend], {
  autoConnect: true,
  withCredentials: true,
});

export const recorder = io(sockets.recorder[backend], {
  autoConnect: true,
  withCredentials: true,
});

export default socket;

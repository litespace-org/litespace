import { backendSockets } from "@litespace/atlas";
import { io } from "socket.io-client";
import { backend } from "@/lib/atlas";

const socket = io(backendSockets[backend], {
  autoConnect: true,
  withCredentials: true,
});

export default socket;

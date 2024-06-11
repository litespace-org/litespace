import { io } from "socket.io-client";

const socket = io("ws://localhost:8080", {
  autoConnect: true,
  withCredentials: true,
});

export default socket;

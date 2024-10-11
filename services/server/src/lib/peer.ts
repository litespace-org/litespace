import { Server } from "http";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ExpressPeerServer as Peer } from "peer";

export function peer(server: Server) {
  const peerServer = Peer(server, { path: "/ls/", key: "peerjs" });

  peerServer.on("connection", function (client) {
    console.log("peerjs client id: ", client.getId());
  });

  return peerServer;
}

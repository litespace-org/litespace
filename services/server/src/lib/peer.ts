import { Server } from "http";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ExpressPeerServer as Peer } from "peer";

export function peer(server: Server) {
  return Peer(server, { path: "/ls/" });
}

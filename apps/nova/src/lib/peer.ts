import { Peer } from "peerjs";
import { backend } from "@litespace/luna/lib";
import { peers } from "@litespace/atlas";

const peerServer = peers[backend];

const peer = new Peer({
  host: peerServer.host,
  path: peerServer.path,
  port: peerServer.port,
  secure: peerServer.secure,
  key: peerServer.key,
  /**
   * todo: add logs only for development and staging
   * Prints log messages depending on the debug level passed in. Defaults to 0.
   *  0 Prints no logs.
   *  1 Prints only errors.
   *  2 Prints errors and warnings.
   *  3 Prints all logs.
   */
  debug: 3,
});

export default peer;

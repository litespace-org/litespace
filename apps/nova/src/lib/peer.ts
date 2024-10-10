import { Peer } from "peerjs";
import { backend } from "@litespace/luna";
import { Backend } from "@litespace/types";
import { backends } from "@litespace/atlas";

const secure = backend === Backend.Production || backend === Backend.Staging;
const url = new URL(backends.main[backend]);
const port =
  url.hostname === "localhost"
    ? Number(url.port)
    : url.protocol === "https:"
    ? 443 // https
    : 80; // http

const peer = new Peer({
  host: url.hostname,
  path: "/peer/ls",
  port,
  secure,
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

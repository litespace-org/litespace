import React, { useMemo } from "react";
import { PeerContext } from "@/peer/context";
import { useBackend } from "@/backend";
import { peers } from "@litespace/atlas";
import { Peer } from "peerjs";

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { backend } = useBackend();
  const peer = useMemo(() => {
    const peerServer = peers[backend];
    return new Peer({
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
  }, [backend]);
  return <PeerContext.Provider value={peer}>{children}</PeerContext.Provider>;
};

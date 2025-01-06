import React, { useCallback, useEffect, useMemo } from "react";
import { PeerContext } from "@/peer/context";
import { useBackend } from "@/backend";
import { peers } from "@litespace/atlas";
import { Peer } from "peerjs";
import { useSocket } from "@/socket";
import { Wss } from "@litespace/types";

/**
 * @deprecated should be removed.
 */
export const PeerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { backend } = useBackend();
  const socket = useSocket();

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
      debug: 1,
    });
  }, [backend]);

  const registerPeer = useCallback(
    (peer: string) => {
      if (!socket) return;
      socket.emit(Wss.ClientEvent.RegisterPeer, { peer });
    },
    [socket]
  );

  useEffect(() => {
    peer.on("open", registerPeer);
    return () => {
      peer.off("open", registerPeer);
    };
  }, [peer, registerPeer]);

  return <PeerContext.Provider value={peer}>{children}</PeerContext.Provider>;
};

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PeerContext } from "@/peer/context";
import { useBackend } from "@/backend";
import { peers } from "@litespace/atlas";
import { Peer } from "peerjs";
import { useAtlas } from "@/atlas";

export const PeerProvider: React.FC<{
  children: React.ReactNode;
  call?: number;
}> = ({ children, call }) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const { backend } = useBackend();
  const atlas = useAtlas();

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

  const onPeerId = useCallback((peer: string) => {
    setPeerId(peer);
  }, []);

  useEffect(() => {
    peer.on("open", onPeerId);
    return () => {
      peer.off("open", onPeerId);
    };
  }, [onPeerId, peer]);

  const deletePeerId = useCallback(() => {
    if (!peerId) return;
    console.log(`Delete peer id from the server: ${peerId}`);
    atlas.peer.delete({ call });
  }, [atlas.peer, call, peerId]);

  useEffect(() => {
    if (!peerId) return;
    // todo: add loading and error handling!
    //! don't register peer id in case of a student
    console.log(`Register peer id on the server: ${peerId}`);
    atlas.peer.register({ peer: peerId, call });
  }, [atlas.peer, call, peerId]);

  useEffect(() => {
    // todo: should be disabled on react native
    window.addEventListener("beforeunload", deletePeerId);
    return () => {
      window.removeEventListener("beforeunload", deletePeerId);
    };
  }, [deletePeerId]);

  return <PeerContext.Provider value={peer}>{children}</PeerContext.Provider>;
};

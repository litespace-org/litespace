import { createContext, useContext } from "react";
import { Peer } from "peerjs";

export const PeerContext = createContext<Peer | null>(null);

export function usePeer() {
  const peer = useContext(PeerContext);
  if (!peer) throw new Error("Invalid context. Using outside the provider?!");
  return peer;
}

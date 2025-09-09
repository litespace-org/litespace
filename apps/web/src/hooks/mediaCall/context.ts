import { CallManager } from "@/modules/MediaCall/CallManager";
import { CallMember } from "@/modules/MediaCall/CallMember";
import { createContext, useContext } from "react";

export type MediaCallCtx = {
  manager: CallManager | null;
  curMember: CallMember | null;
  inMembers: CallMember[];
};

export const MediaCallContext = createContext<MediaCallCtx | null>(null);

export function useMediaCall() {
  const ctx = useContext(MediaCallContext);
  if (!ctx) throw new Error("useCallManager must be used within its provider.");
  return ctx;
}

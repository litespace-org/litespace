import { IUser } from "@litespace/types";

export const GHOST_USERNAME_PREFIX = "ghost:";

export function asGhost(call: number): IUser.Ghost {
  return `${GHOST_USERNAME_PREFIX}${call}`;
}

export function getGhostCall(ghost: IUser.Ghost): number {
  return Number(ghost.replace(GHOST_USERNAME_PREFIX, ""));
}

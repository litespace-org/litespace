import { IUser } from "@litespace/types";

export const GHOST_USERNAME_PREFIX = "ghost:";

export function asGhost(session: string): IUser.Ghost {
  return `${GHOST_USERNAME_PREFIX}${session}`;
}

export function getGhostSession(ghost: IUser.Ghost): string {
  return ghost.replace(GHOST_USERNAME_PREFIX, "");
}

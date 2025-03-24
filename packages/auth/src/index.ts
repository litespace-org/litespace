/* eslint-disable @typescript-eslint/no-namespace */
import { IUser } from "@litespace/types";

declare global {
  namespace Express {
    interface Request {
      _query: { sid: string | undefined };
      user: IUser.Self | IUser.Ghost | undefined;
    }
  }
}

declare module "http" {
  interface IncomingMessage {
    user: IUser.Self | IUser.Ghost | undefined;
  }
}

export { onlyForHandshake, authorizeSocket } from "@/wss";
export {
  authenticated,
  authorizer,
  admin,
  tutorManager,
  studio,
  student,
  tutor,
  is,
  Authorizer,
} from "@/authorization";
export { encodeAuthJwt, decodeAuthJwt } from "@/jwt";
export { authMiddleware, adminOnly } from "@/middleware";

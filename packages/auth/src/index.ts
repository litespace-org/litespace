import { EmptyObject, IUser } from "@litespace/types";

declare global {
  namespace Express {
    interface Request {
      _query: { sid: string | undefined };
      user: undefined | IUser.Self;
    }
  }
}

declare module "http" {
  interface IncomingMessage {
    user: undefined | IUser.Self;
  }
}

export { onlyForHandshake, authorizeSocket } from "@/wss";
export {
  authenticated,
  authorizer,
  admin,
  interviewer,
  mediaProvider,
  student,
  tutor,
  is,
  Authorizer,
  isAdmin,
  isRegAdmin,
  isSuperAdmin,
  isInterviewer,
  isMedaiProvider,
  isTutor,
  isStudent,
  isUser,
} from "@/authorization";
export { encodeAuthJwt, decodeAuthJwt } from "@/jwt";
export { authMiddleware, adminOnly } from "@/middleware";

import { IUser } from "@litespace/types";

declare global {
  namespace Express {
    interface Request {
      _query: { sid: string | undefined };
    }

    interface User extends IUser.Self {}
  }
}

declare module "http" {
  interface IncomingMessage {
    user: IUser.Self;
  }
}

export { onlyForHandshake, authorizeSocket } from "@/wss";
export { initSession } from "@/session";
export { initPassport, AuthStrategy } from "@/passport";
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
} from "@/authorization";
export { encodeJwt } from "@/jwt";

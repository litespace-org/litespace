import { NextFunction, Request, Response } from "express";
import { IUser } from "@litespace/types";
import { forbidden } from "@/lib/error";
import asyncHandler from "express-async-handler";
import { enforce, Method } from "@/middleware/accessControl";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      _query: { sid: string | undefined };
    }

    interface User extends IUser.Self {}
  }
}

// used for socket.io
declare module "http" {
  interface IncomingMessage {
    user: IUser.Self;
  }
}

export const authorize = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role || "unauthorized";
    const method = req.method as Method;
    const route = req.originalUrl;
    const allowed = enforce({ role, route, method });
    if (!allowed) return next(forbidden());
    return next();
  }
);

export const authorized = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authenticated = req.isAuthenticated();
    if (!authenticated) return next(forbidden());
    return next();
  }
);

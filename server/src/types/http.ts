import { IUser } from "@litespace/types";
import type { Request } from "express";

export namespace Request {
  export type Default = Request;
  export type Params<T extends object> = Request<T>;
  export type Body<T extends object> = Request<{}, {}, T>;
  export type Query<T extends object> = Request<{}, {}, {}, T>;
  export type WithUser = { user: IUser.Self };
}

export type { Response } from "express";

import { User } from "@/database";
import type { Request } from "express";

export namespace Request {
  export type Default = Request;
  export type Params<T extends object> = Request<T>;
  export type Body<T extends object> = Request<{}, {}, T>;
  export type Query<T extends object> = Request<{}, {}, {}, T>;
  export type WithUser = { user: User.Self };
}

export type { Response } from "express";

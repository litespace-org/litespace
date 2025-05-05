import { Request, Response, NextFunction } from "express";
import { IUser } from "@litespace/types";
import db from "@fixtures/db";
import { ApiContext } from "@/types/api";
import { Server } from "socket.io";

type MockRequest<Body = object, Params = object, Query = object> = {
  body?: Body;
  params?: Params;
  query?: Query;
  user?: IUser.Self | IUser.Role;
};

class MockResponse<T> {
  data: {
    status: number | null;
    body: T | null;
  } = { status: null, body: null };

  sendStatus(status: number) {
    this.data.status = status;
    return this;
  }

  status(status: number) {
    this.data.status = status;
    return this;
  }

  json(body: T) {
    this.data.body = body;
    return this;
  }

  send(body: T) {
    this.data.body = body;
    return this;
  }
}

export function mockApi<
  Body = object,
  Params = object,
  Query = object,
  Res = unknown,
>(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void
) {
  return async (
    request: MockRequest<Body, Params, Query>
  ): Promise<{ status: number | null; body: Res | null }> => {
    if (typeof request.user === "number")
      request.user = await db.user({ role: request.user });

    const response = new MockResponse<Res>();
    return await new Promise((resolve) => {
      const result = handler(
        request as unknown as Request,
        response as unknown as Response,
        (next) => resolve(next)
      );

      if (result instanceof Promise)
        result.then(() => {
          return resolve(response.data);
        });
      else return resolve(response.data);
    });
  };
}

export function mockApiContext(): ApiContext {
  return { io: new Server() };
}

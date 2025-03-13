import * as ExpressLib from "express";
import { IUser } from "@litespace/types";
import db from "@fixtures/db";
import { ApiContext } from "@/types/api";
import { Server } from "socket.io";

type MockRequest<Body = object, Params = object, Query = object> = {
  body?: Body;
  params?: Params;
  query?: Query;
  user?: IUser.Self | IUser.Role;
  files?: Record<string, Express.Multer.File[]> | Express.Multer.File[];
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

export function mockApi<Body = object, Params = object, Query = object>(
  handler: (
    req: ExpressLib.Request,
    res: ExpressLib.Response,
    next: ExpressLib.NextFunction
  ) => Promise<void> | void
) {
  return async <Response>(
    request: MockRequest<Body, Params, Query>
  ): Promise<{ status: number | null; body: Response | null }> => {
    // these assigns avoids absurd errors while using
    // the mockApi in test suites
    if (!request.body) request.body = {} as Body;
    if (!request.query) request.query = {} as Query;
    if (!request.params) request.params = {} as Params;

    if (typeof request.user === "number")
      request.user = await db.user({ role: request.user });

    const response = new MockResponse<Response>();
    return await new Promise((resolve) => {
      const result = handler(
        request as unknown as ExpressLib.Request,
        response as unknown as ExpressLib.Response,
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

import Express from "express";
import db from "@fixtures/db";
import { IUser } from "@litespace/types";

/**
 * This type shall be used instead of (as) Express.Request type.
 */
type MockRequest<Body = object, Params = object, Query = object> = {
  body?: Body;
  params?: Params;
  query?: Query;
  /**
   * Specify the req.user attribute (logged in user)
   */
  user?: IUser.Self | IUser.Ghost;
  /**
   * In case the user attribute is undefined, this
   * attribute is used while generating a mock user.
   */
  userRole?: IUser.Role;
};

/**
 * This type shall define (to be overriden) all Express.Response
 * methods that are used by the api handlers.
 */
type MockResponse = {
  sendStatus: (code: number) => MockResponse;
  status: (code: number) => MockResponse;
  json: (obj: object) => MockResponse;
};

/**
 * MockResponse type will probably only be used by this function,
 * as it does override Express.Response methods which should allow
 * us to mock Express.Handler functionality.
 * @param callback - This's mandatory to have access to the HTTP response payload.
 */
function getMockResponse(callback?: (res: unknown) => void): Express.Response {
  const mock: MockResponse = {
    sendStatus: (res: number) => {
      if (callback) callback(res);
      return mock;
    },
    status: (res: number) => {
      if (callback) callback(res);
      return mock;
    },
    json: (res: object) => {
      if (callback) callback(res);
      return mock;
    },
  };
  return mock as Express.Response;
}

/**
 * This function combines MockResponse and MockRequest together
 * to forge (return) a function that mocks Express.Handler functionality.
 * Generic types are used here to enable auto-complete, in case the user
 * wishes to.
 */
export function mockApiHandler<
  ReqBody = object,
  ReqParams = object,
  ReqQuery = object,
>(handler: Express.Handler) {
  return async (request: MockRequest<ReqBody, ReqParams, ReqQuery>) => {
    if (!request.user && request.userRole) {
      request.user = await db.user({ role: request.userRole });
    }
    let response: unknown = undefined;
    await asyncronize(
      handler(
        request as unknown as Express.Request,
        getMockResponse((res) => {
          response = res;
        }),
        (err) => {
          response = err;
        }
      )
    );
    return response;
  };
}

async function asyncronize(func: unknown) {
  return await func;
}

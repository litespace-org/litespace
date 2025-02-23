import { Env } from "@litespace/types";
import { AxiosInstance } from "axios";
import { createClient, AuthToken } from "@/client";

type HTTPMethodAttr<T, P = object> = {
  route: string;
  payload?: T;
  params?: P;
};

export class Base {
  public readonly client: AxiosInstance;

  constructor(server: Env.Server, token: AuthToken | null) {
    this.client = createClient(server, token);
  }

  async post<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .post(attr.route, attr.payload ? JSON.stringify(attr.payload) : undefined)
      .then((response) => response.data);
  }

  async put<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .put(attr.route, JSON.stringify(attr.payload))
      .then((response) => response.data);
  }

  async patch<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .patch(attr.route, JSON.stringify(attr.payload))
      .then((response) => response.data);
  }

  async del<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .delete(attr.route, {
        data: JSON.stringify(attr.payload),
        params: attr.params,
      })
      .then((response) => response.data);
  }

  async get<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .get<R>(attr.route, {
        data: JSON.stringify(attr.payload),
        params: attr.params,
      })
      .then((response) => response.data);
  }
}

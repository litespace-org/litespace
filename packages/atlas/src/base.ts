import { Backend } from "@litespace/types";
import { AxiosInstance } from "axios";
import { createClient, GetToken } from "@/client";

export class Base {
  public readonly client: AxiosInstance;

  constructor(backend: Backend, getToken: GetToken) {
    this.client = createClient(backend, getToken);
  }

  async post<T, R = void>(route: string, payload?: T): Promise<R> {
    return this.client
      .post(route, payload ? JSON.stringify(payload) : undefined)
      .then((response) => response.data);
  }

  async put<T, R = void>(route: string, payload: T): Promise<R> {
    return this.client
      .put(route, JSON.stringify(payload))
      .then((response) => response.data);
  }

  async del<T, R = void, P = {}>(route: string, params?: P): Promise<R> {
    return this.client
      .delete(route, { params })
      .then((response) => response.data);
  }

  async get<T, R = void, P = {}>(
    route: string,
    payload?: T,
    params?: P
  ): Promise<R> {
    return this.client
      .get<R>(route, { data: JSON.stringify(payload), params })
      .then((response) => response.data);
  }
}

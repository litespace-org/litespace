import { Backend } from "@litespace/types";
import { AxiosInstance } from "axios";
import { createClient } from "@/client";

export class Base {
  public readonly client: AxiosInstance;

  constructor(backend: Backend) {
    this.client = createClient(backend);
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

  async del<T, R = void>(route: string, payload: T): Promise<R> {
    return this.client.delete(route).then((response) => response.data);
  }

  async get<T, R = void>(route: string, payload?: T): Promise<R> {
    return this.client
      .get<R>(route, { data: payload })
      .then((response) => response.data);
  }
}
